'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What is our total financial exposure across all open matters?',
  'Which companies face criminal liability?',
  'Summarize the most critical matters for the board',
  'Which matters are in settlement negotiations?',
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hello, I\'m your AI Regulatory Assistant. I have full context on all portfolio matters. Ask me anything about your regulatory exposure, risk profile, or specific cases.',
      }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(question: string) {
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 pulse-ring transition-colors"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={22} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[560px] flex flex-col glass rounded-2xl shadow-2xl shadow-black/50 slide-up overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 bg-navy-800/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Sparkles size={14} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-200">AI Regulatory Assistant</div>
                <div className="text-xs text-slate-500">Powered by Claude</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600/80 text-white'
                      : 'bg-navy-700/80 border border-slate-800/60 text-slate-300'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-navy-700/80 border border-slate-800/60 rounded-xl px-4 py-3">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Suggestions — show only when no user messages yet */}
            {messages.length === 1 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-slate-600 px-1">Suggested questions:</p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-xs text-slate-400 hover:text-slate-200 bg-navy-700/40 hover:bg-navy-700/80 border border-slate-800/60 rounded-lg px-3 py-2 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800/60">
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex gap-2"
            >
              <input
                className="input-dark flex-1 rounded-xl px-3 py-2 text-sm"
                placeholder="Ask about your regulatory matters…"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={15} className="text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
