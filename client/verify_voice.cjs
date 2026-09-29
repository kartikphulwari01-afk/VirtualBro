const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting E2E Voice Test...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // We navigate to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log("Page loaded.");

    // Function to simulate voice
    const simulateVoice = async (text) => {
        console.log(`Simulating: "${text}"`);
        await page.evaluate((t) => {
            window.dispatchEvent(new CustomEvent('simulate_voice_input', { detail: t }));
        }, text);
        // Wait a bit for processing
        await new Promise(r => setTimeout(r, 1000));
    };

    // Test 1: Zoro open DevLab
    await simulateVoice('Zoro open devlab');
    
    // Check if DevLab panel opened (activeSection state changed)
    const devLabOpen = await page.evaluate(() => {
        // DevLab usually has specific elements, let's just check the text in the chat
        const chats = Array.from(document.querySelectorAll('.chat-container .markdown-body, .chat-container span'));
        return chats.map(c => c.textContent).some(text => text.includes('Okay bro, here we go. Launching DevLab.'));
    });
    console.log("Test 1 - Command Detected & Chat Logged:", devLabOpen);

    // Test 2: Zoro show time
    await simulateVoice('Zoro show time');
    const timeResponse = await page.evaluate(() => {
        const chats = Array.from(document.querySelectorAll('.chat-container .markdown-body, .chat-container span'));
        return chats.map(c => c.textContent).some(text => text.includes('It\'s') && text.includes('bro'));
    });
    console.log("Test 2 - Time Response Logged:", timeResponse);
    
    await browser.close();
    console.log("Tests Completed.");
})();
