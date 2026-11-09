import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Volume2,
  Copy,
  Check,
  Feather,
  BookOpen,
  Zap,
  Info,
  Loader2,
} from 'lucide-react';
import { ChatMessage, ChatPersonaId, CHAT_PERSONAS } from '../utils/chatUtils';
import { requestSpeech } from '../services/ttsService';

interface GeminiChatbotProps {
  onPlaySpeech: (audioUrl: string, trackLabel: string, voiceName: string) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ onPlaySpeech }) => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<ChatPersonaId>('naseer');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'سلام مڑا داریں بیلی! من میر گل خان نصیر آں۔ دل ءَ متُرسین او ورنا! تئی بوجی اے مستیں زرءِ لاپ ءَ سرسبز بیت۔ تئی دست انت بَھت و تکدیرءِ مهار۔ چے گپ و گالے تئی دل ءَ انت؟\n\n(Greetings my valiant friend! I am Mir Gul Khan Naseer. Do not fear, O youth! The helm of destiny is in your own hands. What is upon your heart?)',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const activePersona = CHAT_PERSONAS.find((p) => p.id === selectedPersonaId) || CHAT_PERSONAS[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handlePersonaChange = (newId: ChatPersonaId) => {
    setSelectedPersonaId(newId);
    const persona = CHAT_PERSONAS.find((p) => p.id === newId) || CHAT_PERSONAS[0];
    let welcomeText = '';
    if (newId === 'naseer') {
      welcomeText = 'سلام بیلی! من نصیر آں۔ بئے گوں توپان ءَ مُکابل، چِکّی تکدیرءِ مهار۔ اے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار۔';
    } else if (newId === 'scholar') {
      welcomeText = 'درود و سلام! I am your Balochi literary scholar assistant. You can ask me about classical metaphors, vocabulary from "O Mardaaren Baloch", grammar, and historical context.';
    } else {
      welcomeText = 'وش اتکے! I am your poetry composition assistant. Tell me what theme, rhyme, or verse you want to compose or translate into Balochi!';
    }

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: welcomeText,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorNotice(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          message: text,
          model: selectedModel,
          systemInstruction: activePersona.systemInstruction,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive reply from Gemini');
      }

      const botMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: Date.now(),
      };

      setMessages([...newHistory, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorNotice(err.message || 'Error communicating with Gemini');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (msg: ChatMessage) => {
    setSpeakingMessageId(msg.id);
    try {
      const voice = selectedPersonaId === 'naseer' ? 'Fenrir' : 'Kore';
      const style =
        selectedPersonaId === 'naseer'
          ? 'Deep heroic poet declaiming with inspiring conviction'
          : 'Clear, articulate, scholarly orator';
      const res = await requestSpeech(msg.text, voice, style);
      if (res.success && res.audioData) {
        onPlaySpeech(res.audioData, `${activePersona.name} (Response)`, voice);
      }
    } catch (e) {
      console.error('Error speaking message:', e);
    } finally {
      setSpeakingMessageId(null);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[750px] bg-slate-900/90 rounded-3xl border border-amber-900/40 shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Top Header & Role Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0c101a] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-950 flex items-center justify-center text-amber-200 border border-amber-500/40 shadow-md">
              {activePersona.avatar === 'feather' ? (
                <Feather className="w-5 h-5" />
              ) : activePersona.avatar === 'book-open' ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm sm:text-base font-display">
                  {activePersona.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-700/50 text-amber-300 font-balochi">
                  {activePersona.nameBalochi}
                </span>
              </div>
              <p className="text-xs text-slate-400">{activePersona.roleTitle}</p>
            </div>
          </div>

          {/* Model Selector & Clear History */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Gemini 3.8 Flash (General tasks, rich reasoning)"
              >
                <Sparkles className="w-3 h-3" />
                <span>3.8 Flash</span>
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Gemini 3.1 Flash Lite (Fast tasks, low latency)"
              >
                <Zap className="w-3 h-3" />
                <span>3.1 Lite</span>
              </button>
            </div>

            <button
              onClick={() => handlePersonaChange(selectedPersonaId)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
              title="Clear conversation history"
              aria-label="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Persona:
          </span>
          {CHAT_PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePersonaChange(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedPersonaId === p.id
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300 font-semibold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error notice */}
      {errorNotice && (
        <div className="p-3 bg-rose-950/60 border-b border-rose-800/50 text-xs text-rose-300 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorNotice}</span>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-rose-400 hover:text-rose-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Thread Container (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-gradient-to-br from-amber-600 to-amber-900 text-amber-200 border border-amber-500/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative group max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-md text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none font-normal'
                }`}
              >
                {/* Content */}
                <div
                  dir="auto"
                  className={`whitespace-pre-wrap select-text break-words leading-relaxed ${
                    /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(msg.text)
                      ? 'font-balochi text-base'
                      : 'font-sans text-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Footer bar on assistant message (Copy & TTS) */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-[10px] text-amber-500/80">
                      {selectedModel}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg)}
                        disabled={speakingMessageId === msg.id}
                        className="hover:text-amber-300 transition-colors flex items-center gap-1"
                        title="Speak with Gemini 3.8 Flash TTS"
                        aria-label="Speak message"
                      >
                        {speakingMessageId === msg.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Recite</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-slate-200 transition-colors"
                        title="Copy message"
                        aria-label="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-900/60 border border-amber-600/40 flex items-center justify-center text-amber-300">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl rounded-tl-none text-xs text-amber-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{activePersona.name} is reflecting...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="px-4 py-2 bg-[#0c101a] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">
          Try asking:
        </span>
        {activePersona.suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-amber-300/80 hover:text-amber-200 border border-slate-800 hover:border-amber-700/50 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Message ${activePersona.name} (in Balochi, English, or Persian)...`}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all"
        />

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-amber-950/50 disabled:opacity-50 flex items-center justify-center shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
