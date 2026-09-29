import { useState, useCallback } from "react";

const API = "http://localhost:5000";

/**
 * Shared Zoro chat hook — used by both ZoroSidebar and ZoroOS.
 * Message shape: { id, text, sender: 'user' | 'zoro' }
 */
export default function useZoroChat(initialMessages = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (input, extraBody = {}) => {
    const trimmed = (input || "").trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now(), text: trimmed, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, ...extraBody }),
      });

      const data = await res.json();

      // Safely extract reply string — never render objects
      let reply = data?.reply ?? "";
      if (typeof reply !== "string") reply = JSON.stringify(reply);
      if (!reply) reply = "No response from AI.";

      const aiMsg = { id: Date.now() + 1, text: reply, sender: "zoro" };
      setMessages(prev => [...prev, aiMsg]);

      // Return parsed data so caller can handle memory_update etc.
      return data;
    } catch {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: "Server error. Check connection.", sender: "zoro" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearMessages = useCallback((initial = []) => {
    setMessages(initial);
  }, []);

  return { messages, setMessages, sendMessage, clearMessages, loading };
}
