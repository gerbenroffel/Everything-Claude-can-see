'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What are the highest risk matters?',
  'Summarize our Brazil exposure',
  'Which matters have criminal risk?',
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, I could not generate a response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full bg-blue-500 opacity-40"
              style={{ animation: 'pulse-ring 2s ease-out infinite' }}
            />
            <button
              onClick={() => setOpen(true)}
              className="relative w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-2xl shadow-blue-900/50 transition-all hover:scale-105"
            >
              <MessageCircle size={22} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl shadow-black/60 slide-in"
          style={{
            width: 400,
            height: 520,
            background: 'rgba(7,13,26,0.97)',
            border: '1px solid rgba(59,130,246,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
            <div>
              <div className="font-semibold text-white text-sm">AI Regulatory Assistant</div>
              <div className="text-xs text-slate-500">Powered by Claude</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-blue-900/30 text-slate-400 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 text-center">Ask about your regulatory portfolio</div>
                {SUGGESTED_QUESTIONS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                    style={{ background: 'rgba(30,53,97,0.3)', border: '1px solid rgba(59,130,246,0.15)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'text-slate-200 rounded-bl-sm'
                  }`}
                  style={msg.role === 'assistant' ? { background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(59,130,246,0.15)' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(59,130,246,0.1)', paddingTop: 12 }}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about regulatory matters..."
                className="flex-1 px-3.5 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
                style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(59,130,246,0.2)' }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
