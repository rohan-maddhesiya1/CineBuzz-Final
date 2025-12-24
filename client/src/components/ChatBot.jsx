import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");

    const userMessage = { sender: "user", text: userText };
    // push immediately so UI feels responsive
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);

    // Format conversation
    const formattedMessages = [
      ...messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: userText }
    ];

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: formattedMessages })
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.success) {
        setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Something went wrong, try again!" }
        ]);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Server unreachable. Check backend." }
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        title="Chat with Cinebuzz AI"
        className="fixed bottom-5 right-5 p-3 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-2xl hover:scale-105 transform transition focus:outline-none focus:ring-4 focus:ring-indigo-400/30 z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.85L3 20l1.85-4A7.972 7.972 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-5 md:right-10 w-[90%] max-w-md bg-[#111] border border-gray-700 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-3 border-b border-gray-700 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.85L3 20l1.85-4A7.972 7.972 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Cinebuzz AI</h2>
                <p className="text-xs text-gray-400">Ask about movies, bookings, or plans</p>
              </div>
            </div>

            <div className="ml-auto">
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="h-96 overflow-y-auto space-y-3 p-1 custom-scrollbar"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white text-sm">
                  {msg.sender === "user" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A9 9 0 1118.88 6.196 9 9 0 015.12 17.804z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5V18h-2v-1.5A4.5 4.5 0 017.5 12h2A3.5 3.5 0 0013 15.5z" />
                    </svg>
                  )}
                </div>

                {/* Chat Bubble */}
                <div
                  className={`p-3 max-w-[75%] rounded-2xl text-white prose prose-invert ${
                    msg.sender === "user"
                      ? "bg-indigo-700/20 rounded-br-none"
                      : "bg-white/6 rounded-bl-none"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                </div>

                <div className="bg-white/6 p-2 rounded-2xl rounded-bl-none text-sm text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.12s' }} />
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.24s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Message Cinebuzz AI..."
              className="flex-1 p-3 rounded-xl bg-white/5 border border-gray-700 text-white placeholder-gray-400 focus:outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-primary px-4 py-2 rounded-xl text-white hover:bg-primary/80 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}