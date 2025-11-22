
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Sparkles, CheckCircle, BookOpen, Briefcase, BookmarkPlus, Check, Circle } from 'lucide-react';
import { Post, AIKnowledge } from '../types';
import { analyzePostWithAI } from '../services/geminiService';

interface PostCardProps {
  post: Post;
  onUpdatePost: (updatedPost: Post) => void;
  onSaveKnowledge: (item: AIKnowledge, postId: string) => void;
  onToggleTask?: (postId: string, taskId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdatePost, onSaveKnowledge, onToggleTask }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [savedIndices, setSavedIndices] = useState<number[]>([]);

  const handleAnalyze = async () => {
    if (post.aiAnalysis) return; 
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePostWithAI(post);
      onUpdatePost({ ...post, aiAnalysis: analysis });
    } catch (error) {
      alert("分析に失敗しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveKnowledge = (k: AIKnowledge, index: number) => {
    onSaveKnowledge(k, post.id);
    setSavedIndices([...savedIndices, index]);
  };

  // Map sentiment to Japanese display
  const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
    const config: Record<string, { label: string, style: string }> = {
      'Positive': { label: 'ポジティブ', style: 'bg-green-100 text-green-700 border-green-200' },
      'Neutral': { label: '通常', style: 'bg-gray-100 text-gray-700 border-gray-200' },
      'Negative': { label: 'ネガティブ', style: 'bg-red-100 text-red-700 border-red-200' },
      'Urgent': { label: '要対応', style: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse' },
    };
    
    const conf = config[sentiment] || config['Neutral'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${conf.style}`}>
        {conf.label}
      </span>
    );
  };

  const translatePriority = (p: string) => {
    switch(p) {
      case 'High': return '高';
      case 'Medium': return '中';
      case 'Low': return '低';
      default: return p;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{post.user.name}</h3>
            <p className="text-xs text-gray-500">{post.user.department} • {post.user.role}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
      </div>

      {/* Image */}
      <div className="relative bg-gray-100 aspect-video w-full overflow-hidden">
        <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
      </div>

      {/* Action Bar */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <MessageCircle size={24} />
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <Share2 size={24} />
          </button>
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing || !!post.aiAnalysis}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${post.aiAnalysis 
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-default' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
            } ${isAnalyzing ? 'opacity-70' : ''}`}
        >
          <Sparkles size={16} className={isAnalyzing ? "animate-spin" : ""} />
          <span>{isAnalyzing ? 'AI分析中...' : post.aiAnalysis ? '分析完了' : 'AI分析を実行'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="text-sm font-semibold mb-1 text-gray-600">いいね！ {post.likes + (isLiked ? 1 : 0)}件</div>
        <div className="text-sm text-gray-800 mb-2 whitespace-pre-wrap leading-relaxed">
          <span className="font-semibold mr-2">{post.user.username}</span>
          {post.caption}
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {post.hashtags.map(tag => (
            <span key={tag} className="text-xs text-blue-600 hover:underline cursor-pointer">{tag}</span>
          ))}
        </div>
      </div>

      {/* AI Insights Panel (Conditional) */}
      {post.aiAnalysis && (
        <div className="mx-4 mb-4 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="bg-gradient-to-r from-slate-100 to-white px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI 分析インサイト</span>
            </div>
            <SentimentBadge sentiment={post.aiAnalysis.sentiment} />
          </div>
          
          <div className="p-4 space-y-4">
            {/* Summary */}
            <p className="text-sm text-slate-600 italic border-l-2 border-indigo-300 pl-3">
              "{post.aiAnalysis.summary}"
            </p>

            {/* Tasks */}
            {post.aiAnalysis.tasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <Briefcase size={12} /> 提案されたタスク
                </h4>
                <div className="space-y-2">
                  {post.aiAnalysis.tasks.map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg border shadow-sm flex justify-between items-start transition-colors ${
                        task.isCompleted ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                            {task.title}
                          </span>
                          <span className={`text-[10px] px-1.5 rounded border ${
                            task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>優先度: {translatePriority(task.priority)}</span>
                        </div>
                        <p className="text-xs text-slate-500">{task.description}</p>
                        {task.assigneeSuggestion && (
                           <p className="text-xs text-indigo-500 mt-1">推奨担当: {task.assigneeSuggestion}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => onToggleTask && onToggleTask(post.id, task.id)}
                        className={`transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-green-600'}`}
                        title={task.isCompleted ? "未完了に戻す" : "完了にする"}
                      >
                        {task.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge */}
            {post.aiAnalysis.knowledge.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
                  <BookOpen size={12} /> ナレッジ候補
                </h4>
                <div className="grid gap-2">
                  {post.aiAnalysis.knowledge.map((k, idx) => {
                    const isSaved = savedIndices.includes(idx);
                    return (
                      <div key={idx} className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-blue-700">{k.category}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-800">{k.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{k.content}</p>
                        </div>
                        <button 
                          onClick={() => !isSaved && handleSaveKnowledge(k, idx)}
                          disabled={isSaved}
                          className={`self-start p-1.5 rounded-md transition-all shrink-0 ${
                            isSaved 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white'
                          }`}
                          title={isSaved ? "保存済み" : "ナレッジベースに保存"}
                        >
                          {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
