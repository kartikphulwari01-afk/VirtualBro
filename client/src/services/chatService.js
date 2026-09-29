export async function sendMessage(message, context = null) {
  try {
    const isDevLabMode = !!context;
    const body = {
      message: message,
      isDevLabMode,
    };
    if (isDevLabMode) body.devLabContext = context;

    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (isDevLabMode) {
      const jsonRes = await res.json();
      return jsonRes.result; // Returns the raw JSON string
    }

    const text = await res.text();
    return text;
  } catch (error) {
    console.error("Chat Service Error:", error);
    return "ERROR: System connection failed.";
  }
}
