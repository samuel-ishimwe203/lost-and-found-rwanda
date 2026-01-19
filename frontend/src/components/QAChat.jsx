import { useState } from "react";
import { MessageCircle, XIcon, Send } from 'lucide-react';

export default function QAChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("email"); // "email" or "chat"
  const [email, setEmail] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! Welcome to Lost & Found Rwanda support. How can we help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle email submission
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setStep("chat");
      // Add welcome message with email
      setMessages([
        {
          id: 1,
          type: "bot",
          text: `Hello! Welcome to Lost & Found Rwanda support. How can we help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Handle message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        type: "user",
        text: inputValue,
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage]);
      setInputValue("");

      // Simulate bot response
      setIsLoading(true);
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          type: "bot",
          text: getBotResponse(inputValue),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    }
  };

  // Generate bot responses based on user input
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (
      input.includes("lost") ||
      input.includes("find") ||
      input.includes("item")
    ) {
      return "To report a lost or found item, please log in to your dashboard and click 'Create Post'. You can provide details about the item, location, and reward. Our team will help spread the word!";
    }
    if (input.includes("account") || input.includes("profile")) {
      return "You can manage your account profile from the 'My Profile' section in your dashboard. Update your information, contact details, and preferences there.";
    }
    if (input.includes("search") || input.includes("find items")) {
      return "Visit our 'All Postings' page to search for lost or found items. You can filter by category, location, and date. When you find something of interest, you can contact the poster directly.";
    }
    if (input.includes("reward")) {
      return "You can offer a reward when posting a lost item. Set an amount that encourages finders to contact you. Many successful recoveries happen with reasonable rewards!";
    }
    if (input.includes("contact") || input.includes("message")) {
      return "Use the 'Messages' section in your dashboard to communicate with other users. You can reply to inquiries and manage conversations safely through our platform.";
    }
    if (
      input.includes("help") ||
      input.includes("support") ||
      input.includes("problem")
    ) {
      return "We're here to help! Please describe your issue in detail, and our support team will get back to you as soon as possible at the email you provided.";
    }
    if (
      input.includes("security") ||
      input.includes("safe") ||
      input.includes("privacy")
    ) {
      return "Your safety and privacy are our top priorities. All personal information is encrypted and protected. Never share sensitive details like passwords or full documents publicly.";
    }
    if (
      input.includes("time") ||
      input.includes("how long") ||
      input.includes("recover")
    ) {
      return "Most items are recovered within 1-2 weeks of posting. The faster you post with clear details and a good reward, the better your chances!";
    }

    return "Thank you for your question! Could you provide more details? Our team can help with questions about posting items, searching, account management, messaging, rewards, and more.";
  };

  // Close chat and reset
  const handleClose = () => {
    setIsOpen(false);
    setStep("email");
    setEmail("");
    setMessages([
      {
        id: 1,
        type: "bot",
        text: "Hello! Welcome to Lost & Found Rwanda support. How can we help you today?",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Text Label */}
        <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold whitespace-nowrap border border-green-200">
          Ask Question
        </div>
        
        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center justify-center"
          title="Ask a Question"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Lost & Found Support</h3>
        </div>
        <button
          onClick={handleClose}
          className="hover:bg-white/20 p-1 rounded transition"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Email Step */}
      {step === "email" && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-700 font-semibold mb-2">
              Enter your email to continue
            </p>
            <p className="text-sm text-gray-500">
              We'll use this to help you better
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition"
            >
              Start Chat
            </button>
          </form>
        </div>
      )}

      {/* Chat Step */}
      {step === "chat" && (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.type === "user"
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm rounded-bl-none">
                  <span className="inline-block animate-bounce">●</span>
                  <span className="inline-block animate-bounce mx-1" style={{ animationDelay: "0.1s" }}>
                    ●
                  </span>
                  <span className="inline-block animate-bounce" style={{ animationDelay: "0.2s" }}>
                    ●
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
