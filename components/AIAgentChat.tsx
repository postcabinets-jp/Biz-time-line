
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User as UserIcon, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { ChatMessage, Post, KnowledgeItem } from '../types';
import { chatWithAgent } from '../services/geminiService';

interface AIAgentChatProps {
  variant: 'modal' | 'page';
  isOpen: boolean; // Only relevant for modal
  onClose?: () => void;
  posts: Post[];
  knowledge: KnowledgeItem[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const AIAgentChat: React.FC<AIAgentChatProps> = ({ 
  variant, 
  isOpen, 
  onClose, 
  posts, 
  knowledge,
  messages,
  setMessages
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Pass history without the new user message to the service, effectively
    // Or let the service handle the full history. 
    // The service expects history, let's pass updated history.
    const updatedHistory = [...messages, userMsg];

    const responseText = await chatWithAgent(userMsg.text, messages, posts, knowledge);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  if (variant === 'modal' && !isOpen) return null;

  // Styles based on variant
  const containerClasses = variant === 'modal'
    ? "fixed inset-0 z-50 flex justify-end items-end pointer-events-none"
    : "h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500";

  const innerClasses = variant === 'modal'
    ? "pointer-events-auto w-full md:w-[450px] h-[600px] max-h-[90vh] bg-white shadow-2xl md:rounded-t-2xl md:mr-6 border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
    : "flex-1 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden shadow-sm";

  return (
    <div className={containerClasses}>
      <div className={innerClasses}>
        
        {/* Header */}
        <div className={`p-4 flex justify-between items-center text-white ${variant === 'modal' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white border-b border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`${variant === 'modal' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'} p-2 rounded-lg backdrop-blur-sm`}>
              <Bot size={24} />
            </div>
            <div>
              <h3 className={`font-bold ${variant === 'modal' ? 'text-white' : 'text-gray-900'}`}>
                BizAgent コンサルタント
              </h3>
              <p className={`text-xs flex items-center gap-1 ${variant === 'modal' ? 'text-indigo-100' : 'text-gray-500'}`}>
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                オンライン • {posts.length}件の投稿と{knowledge.length}件のナレッジを参照中
              </p>
            </div>
          </div>
          
          {variant === 'modal' && onClose && (
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <Sparkles size={48} className="text-indigo-200" />
                <p>AI コンサルタントに相談してみましょう。</p>
             </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'} text-white shadow-sm`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Sparkles size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
               <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    <Sparkles size={16} />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="プロジェクトの課題やタスクの要約を依頼してください..."
              className="w-full pl-4 pr-12 py-4 bg-gray-50 border-gray-200 border focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all outline-none text-base"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-center text-gray-400 mt-3">
            BizAgentはGemini 2.5 Flashを使用しています。回答は必ずしも正確ではありません。
          </p>
        </div>
      </div>
    </div>
  );
};
