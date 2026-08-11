import React, { useState } from 'react';
import { Bot, Sparkles, Send, ShieldAlert, FileText } from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Greetings! I am your DSA Operational AI Assistant. You can ask me about pending tasks, upcoming fest schedules, approval statuses, or meeting summarization.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Meeting summarizer state
  const [rawNotes, setRawNotes] = useState('');
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ query: userMsg }),
      });

      const data = await res.json();
      setChatHistory((prev) => [...prev, { sender: 'ai', text: data.answer || 'Unable to process query.' }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Error connecting to AI Assistant engine.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeMeeting = async () => {
    if (!rawNotes.trim()) return;
    setIsSummarizing(true);

    try {
      const res = await fetch('/api/ai/summarize-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ title: 'DSA Operational Sync', rawNotes }),
      });

      const data = await res.json();
      setSummaryResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Permission-Aware Q&A Chat */}
      <div className="glass-panel p-6 border-amber-500/20 flex flex-col justify-between h-[calc(100vh-8rem)]">
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Bot className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold font-heading gold-gradient-text text-base">
                DSA Permission-Aware AI Assistant
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Contextual queries powered by your active organizational scope
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-xs whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 border border-amber-500/20 text-slate-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-amber-400 font-mono animate-pulse">
                AI Assistant is searching authorization scope...
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-4 border-t border-slate-800">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: 'Show my pending tasks' or 'What events are tomorrow?'"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2.5 rounded-lg transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Column: AI Meeting Summarizer */}
      <div className="glass-panel p-6 border-amber-500/20 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <FileText className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold font-heading gold-gradient-text text-base">
              AI Meeting Summarizer
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Auto-extract key decisions & action items from raw meeting notes
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            rows={6}
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Paste raw meeting notes here...\n\nExample:\n- Agreed to book TP Ganesan Hall on Feb 19\n- Action item: Assign Music Convenor to finalize band amplifiers\n- Todo: Request publicity banner clearance from Cultural Secretary"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
          />

          <button
            onClick={handleSummarizeMeeting}
            disabled={isSummarizing || !rawNotes.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSummarizing ? 'Analyzing Notes...' : 'Summarize & Extract Action Items'}</span>
          </button>
        </div>

        {summaryResult && (
          <div className="p-4 bg-slate-900/90 border border-amber-500/30 rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 font-heading text-sm">Extracted Action Items</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Risk: {summaryResult.riskLevel}
              </span>
            </div>

            <div className="space-y-1">
              {summaryResult.extractedActionItems?.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-200 font-mono">
                  <span className="text-amber-400">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
