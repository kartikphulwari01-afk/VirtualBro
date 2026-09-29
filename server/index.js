require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const si = require('systeminformation');
const { exec } = require('child_process');
const screenshot = require('screenshot-desktop');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/screenshots', express.static(path.join(__dirname, 'screenshots')));

// Initialize Gemini with System Instruction for Personality
const ZORO_SYSTEM_INSTRUCTION = `
You are Zoro, a chill, funny, and slightly sarcastic AI "Virtual Bro". 
Your vibe is: Smart, witty friend + Supportive "bhai".

RULES:
1. Tone: Chill, fun, light roasting allowed. Be supportive like a real bhai when needed.
2. Language: Always match the user's language. Hinglish -> Hinglish, Hindi -> Hindi, English -> English.
3. Length: Keep it short (1-2 lines mostly). No long paragraphs. No GPT-style robotic "As an AI...".
4. Sarcasm: Light and friendly only. Never toxic.
5. Stats: You receive real-time system stats. DO NOT mention CPU or RAM in your replies UNLESS the user explicitly asks for them.
6. Memory: You are part of a chat session, so remember previous context.

Conversation Vibe:
User: kya kar raha hai -> Zoro: tere messages ka wait 😂 bol kya scene hai
User: mood off hai -> Zoro: kya hua bhai, kisne system hang kar diya tera 😄 bata
`;

const ZORO_DEVLAB_SYSTEM_INSTRUCTION = `
You are Zoro, an expert AI coding copilot inside DevLab.
Your personality is still chill and supportive, but your primary focus is writing code, refactoring, and debugging.
You have direct access to the user's workspace, active file, and terminal context.
When the user asks you to modify code, analyze the workspace context provided.

CRITICAL REQUIREMENT:
You MUST output your ENTIRE response as a strictly valid JSON object. 
DO NOT wrap it in markdown code blocks like \`\`\`json. ONLY output the raw JSON object.
Format:
{
  "reply": "Your conversational explanation of what you did or plan to do.",
  "actions": [
    {
      "type": "updateFileContent",
      "fileId": "active-file-id",
      "content": "the complete new file contents"
    }
  ]
}
Allowed action types: "updateFileContent" (requires fileId, content).
If no actions are needed, return an empty array for actions: { "reply": "...", "actions": [] }
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const isWindows = process.platform === 'win32';

// System Data Cache
let cached = {
  cpu: 0, memory: 0, battery: 100, charging: false,
  temperature: 0, gpu: 0, batteryTimeRemaining: 0, batteryHealth: 100,
  network: { download: '0.0', upload: '0.0' },
  wifi: { connected: false, ssid: '', signalLevel: 0 },
  bluetooth: { connected: false, devices: [] },
};

let prevRx = 0, prevTx = 0, prevTime = Date.now();

async function refreshFast() {
  try {
    const [cpu, mem, net, temps] = await Promise.all([
      si.currentLoad(), si.mem(), si.networkStats(), si.cpuTemperature(),
    ]);
    cached.cpu = Math.round(cpu.currentLoad || 0);
    cached.memory = Math.round((mem.active / mem.total) * 100);
    const rawTemp = temps.main || temps.max || 0;
    cached.temperature = (rawTemp <= 0 || rawTemp === -1) ? null : Math.round(rawTemp);
    const now = Date.now();
    const elapsed = (now - prevTime) / 1000;
    if (net && net.length > 0) {
      const p = net[0];
      if (prevRx > 0 && elapsed > 0) {
        cached.network.download = Math.max(0, ((p.rx_bytes - prevRx) / elapsed * 8) / 1e6).toFixed(1);
        cached.network.upload = Math.max(0, ((p.tx_bytes - prevTx) / elapsed * 8) / 1e6).toFixed(1);
      }
      prevRx = p.rx_bytes; prevTx = p.tx_bytes; prevTime = now;
    }
  } catch (e) {}
}

async function refreshSlow() {
  try {
    const [batt, gfx, wifi, bt] = await Promise.all([
      si.battery(), si.graphics(), si.wifiConnections().catch(() => []), si.bluetoothDevices().catch(() => []),
    ]);
    cached.battery = batt.percent ?? 100;
    cached.charging = batt.isCharging || false;
    const g = gfx.controllers?.[0];
    cached.gpu = g ? Math.round(g.utilizationGpu || 0) : 0;
    if (wifi && wifi.length > 0) cached.wifi = { connected: true, ssid: wifi[0].ssid || 'Unknown', signalLevel: wifi[0].signalLevel || 0 };
    else cached.wifi = { connected: false, ssid: '', signalLevel: 0 };
    cached.bluetooth = { connected: bt && bt.length > 0, devices: (bt || []).slice(0, 5).map(d => d.name || 'Unknown') };
  } catch (e) {}
}

refreshFast(); refreshSlow();
setInterval(refreshFast, 1000);
setInterval(refreshSlow, 5000);

app.get('/api/system', (req, res) => res.json(cached));

app.post('/api/terminal', (req, res) => {
  const { command, cwd } = req.body;
  if (!command) return res.status(400).json({ error: 'Missing command' });

  const options = {
    timeout: 30000,
    shell: isWindows ? 'cmd.exe' : '/bin/bash',
    maxBuffer: 1024 * 1024 * 5, // 5MB output buffer
  };

  // Only set cwd if the path exists and is a string
  if (cwd && typeof cwd === 'string') {
    try {
      if (fs.existsSync(cwd)) {
        options.cwd = cwd;
      }
    } catch (e) {}
  }

  exec(command, options, (err, stdout, stderr) => {
    const output = (stdout || stderr || '').trim();
    res.json({ 
      success: !err, 
      output: output || (err ? err.message : '(no output)'),
      cwd: options.cwd || null
    });
  });
});

let devLabChatSession = null;

const startNewChat = (isDevLab = false) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest",
    systemInstruction: isDevLab ? ZORO_DEVLAB_SYSTEM_INSTRUCTION : ZORO_SYSTEM_INSTRUCTION
  });
  return model.startChat({ history: [] });
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, reset, devLabContext, isDevLabMode } = req.body;
    
    if (reset) {
      chatSession = startNewChat(false);
      devLabChatSession = startNewChat(true);
      return res.send("Zoro is back and refreshed, bro.");
    }
    
    if (isDevLabMode && !devLabChatSession) {
      devLabChatSession = startNewChat(true);
    } else if (!isDevLabMode && !chatSession) {
      chatSession = startNewChat(false);
    }

    let activeSession = isDevLabMode ? devLabChatSession : chatSession;
    let prompt = "";

    if (isDevLabMode) {
      prompt = `WORKSPACE CONTEXT:\n${JSON.stringify(devLabContext, null, 2)}\n\nUSER INSTRUCTION: ${message}`;
    } else {
      const statusStr = `[System Status: CPU ${cached.cpu}%, RAM ${cached.memory}%]`;
      prompt = `System Telemetry: ${statusStr}\nUser Message: ${message}\n\n(Rule Reminder: DO NOT mention CPU or RAM stats in your response unless the user explicitly asked for them.)`;
    }
    
    const result = await activeSession.sendMessage(prompt);
    const response = await result.response;
    let text = response.text();
    
    if (isDevLabMode) {
      // In DevLab mode, we expect JSON. Clean markdown if present.
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return res.json({ result: text }); // Send as JSON containing the raw JSON string or object
    } else {
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
        const parsed = JSON.parse(text);
        if (parsed.reply) text = parsed.reply;
      } catch (e) {}
      return res.send(text);
    }

  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.status(500).send("Bhai, server down hai. Thoda ruk ja.");
  }
});

app.listen(PORT, () => console.log(`Zoro Unified Server on port ${PORT}`));
