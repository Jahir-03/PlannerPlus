import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, Send, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

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
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [savedLogId, setSavedLogId] = useState<string | null>(null);

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
      setSavedLogId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSaveMeetingLog = async () => {
    if (!summaryResult) return;
    setIsSavingLog(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({
          type: 'MEETING',
          title: summaryResult.meetingTitle || 'AI Extracted Operational Meeting Minutes',
          summary: rawNotes,
          keyDecisions: summaryResult.extractedActionItems?.join('\n') || 'Decisions extracted by AI Assistant.',
          location: 'Campus Council Room / Virtual Sync',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedLogId(data.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingLog(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Permission-Aware Q&A Chat */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between h-[calc(100vh-8rem)]">
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Bot className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-bold font-heading text-slate-900 text-base">
                DSA Permission-Aware AI Assistant
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
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
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-xs text-slate-500 font-mono animate-pulse">
                AI Assistant is searching authorization scope...
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-4 border-t border-slate-100">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask: 'Show my pending tasks' or 'What events are tomorrow?'"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Column: AI Meeting Summarizer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="font-bold font-heading text-slate-900 text-base">
              AI Meeting Summarizer
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">
              Auto-extract key decisions & action items from raw meeting notes
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            rows={6}
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Paste raw meeting notes here...&#10;&#10;Example:&#10;- Agreed to book TP Ganesan Hall on Feb 19&#10;- Action item: Assign Music Convenor to finalize band amplifiers&#10;- Todo: Request publicity banner clearance from Cultural Secretary"
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 font-mono"
          />

          <button
            onClick={handleSummarizeMeeting}
            disabled={isSummarizing || !rawNotes.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isSummarizing ? 'Analyzing Notes...' : 'Summarize & Extract Action Items'}</span>
          </button>
        </div>

        {summaryResult && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 font-heading text-sm">Extracted Action Items</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                Risk: {summaryResult.riskLevel}
              </span>
            </div>

            <div className="space-y-1">
              {summaryResult.extractedActionItems?.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-2 text-slate-700 font-mono">
                  <span className="text-slate-400">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {savedLogId ? (
                <Link
                  to="/logs"
                  className="text-emerald-700 text-xs font-semibold flex items-center space-x-1.5 hover:underline"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Saved to Archive! Open Log & Discussions &rarr;</span>
                </Link>
              ) : (
                <button
                  onClick={handleSaveMeetingLog}
                  disabled={isSavingLog}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isSavingLog ? 'Saving to Archive...' : 'Save to Meeting Logs Archive'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
