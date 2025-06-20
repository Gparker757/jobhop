import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Briefcase, ArrowUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const HopCoach = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "Hey there! I'm your Hop Coach 🚀 I'm here to help you navigate your career transition. What's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Help me find better jobs",
    "Review my career plan",
    "Interview preparation tips",
    "How to negotiate salary"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAICareerTip = async (userMessage: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) return "DeepSeek API key not set. Please check your .env file.";
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "JobHop AI HopCoach"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [
            { role: "system", content: "You are a friendly, expert career coach. Give concise, actionable, and positive career tips for job hoppers and career changers." },
            { role: "user", content: userMessage },
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });
      if (!response.ok) throw new Error("DeepSeek API error");
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a tip right now.";
    } catch (err) {
      return "Sorry, there was a problem connecting to the AI. Please try again later.";
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Call DeepSeek for bot response
    const botContent = await getAICareerTip(message);
    const botResponse: Message = {
      id: messages.length + 2,
      type: "bot",
      content: botContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen dark-gradient-bg pb-20">
      {/* Header */}
      <header className="px-4 py-6 bg-slate-800/80 backdrop-blur-sm border-b border-slate-600">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Briefcase className="h-6 w-6 text-jobhop-teal" />
              <ArrowUp className="h-3 w-3 text-jobhop-green absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-jobhop-teal">Hop Coach</h1>
              <p className="text-xs text-slate-400">Your AI career advisor</p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-jobhop-teal text-white text-xs">Online</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="px-4 py-4 pb-32">
        <div className="max-w-md mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}>
                <div className={`p-2 rounded-full ${
                  msg.type === "user" 
                    ? "bg-jobhop-teal text-white" 
                    : "bg-slate-600 text-white"
                }`}>
                  {msg.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                
                <Card className={`p-3 ${
                  msg.type === "user" 
                    ? "bg-jobhop-teal text-white" 
                    : "glass-card"
                }`}>
                  <p className={`text-sm whitespace-pre-line ${
                    msg.type === "user" ? "text-white" : "text-white"
                  }`}>{msg.content}</p>
                  <p className={`text-xs mt-2 ${
                    msg.type === "user" ? "text-teal-100" : "text-slate-300"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </Card>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="p-2 rounded-full bg-slate-600 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <Card className="p-3 glass-card">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="fixed bottom-24 left-0 right-0 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs bg-slate-800/90 backdrop-blur-sm border-slate-600 text-slate-200 hover:bg-slate-700/60"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-3 glass-card">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask me anything about your career..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-slate-800/80 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:ring-jobhop-teal focus:border-jobhop-teal"
              />
              <Button 
                onClick={sendMessage}
                size="sm"
                className="bg-jobhop-teal hover:bg-jobhop-teal/90 text-white"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HopCoach;
