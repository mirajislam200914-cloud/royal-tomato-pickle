import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { chatWithAI } from "../lib/gemini";
import ReactMarkdown from "react-markdown";
import { useSettings } from "../context/SettingsContext";

export default function AIChatBot() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: `Hello! I am your ${settings.logoText} AI Ambassador. How may I assist you with our prestigious collections today?` },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatWithAI(input, messages);
      setMessages((prev) => [...prev, { role: "ai", text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Error connecting to service." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-royal-red rounded-full flex items-center justify-center shadow-2xl z-40 hover:scale-110 transition-transform group"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-royal-red animate-pulse" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[600px] glass rounded-3xl z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-royal-red flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-white">{settings.logoText} AI Ambassador</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Prestige Support</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === "user" ? "bg-royal-red text-white" : "bg-white/10 text-white/90"
                    }`}
                  >
                    <div className="markdown-body">
                         <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-white/10 px-4 py-3 rounded-2xl animate-pulse text-xs text-white/40 italic">{settings.logoText} Ambassador is typing...</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-royal-red/50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} size="icon" className="rounded-full bg-royal-red">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
