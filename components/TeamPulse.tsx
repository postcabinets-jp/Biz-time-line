
import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, Heart, Zap, ArrowUpRight, MessageSquareQuote, BrainCircuit, Loader2 } from 'lucide-react';
import { Post, Meeting, TeamHealthAnalysis } from '../types';
import { analyzeTeamHealth } from '../services/geminiService';

interface TeamPulseProps {
  posts: Post[];
  meetings: Meeting[];
}

export const TeamPulse: React.FC<TeamPulseProps> = ({ posts, meetings }) => {
  const [analysis, setAnalysis] = useState<TeamHealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const result = await analyzeTeamHealth(posts, meetings);
        setAnalysis(result);
      } catch (error) {
        console.error("Failed to analyze team health", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [posts.length, meetings.length]); // Re-analyze only when data count changes

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20"></div>
          <div className="bg-white p-4 rounded-full shadow-xl border border-blue-100 relative z-10">
            <BrainCircuit className="text-blue-600 animate-pulse" size={48} />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800">AIがチームの状態を診断中...</h3>
          <p className="text-gray-500 mt-2">投稿内容、会議ログ、感情データを統合分析しています</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // Trend Chart Data (Mock history + current real score)
  // In a real app, we would fetch historical scores from DB
  const trendPoints = [65, 70, 68, 72, 60, 75, analysis.score];
  const pointsString = trendPoints.map((val, i) => {
    const x = (i / (trendPoints.length - 1)) * 100;
    const y = 100 - ((val - 0) / (100 - 0)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Pulse Dashboard</h2>
          <p className="text-gray-500">組織の「感情」と「健全性」をAIがリアルタイムに可視化します。</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          AI診断完了
        </div>
      </div>

      {/* Main Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Health Score - Primary */}
        <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
           
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-6">
               <span className="font-medium text-blue-100 flex items-center gap-2">
                 <Activity size={18} /> 組織健全性スコア
               </span>
               <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">リアルタイムAI評価</span>
             </div>
             
             <div className="flex items-end gap-4 mb-4">
               <div className="text-6xl font-bold tracking-tighter">{analysis.score}</div>
               <div className="text-lg text-blue-200 mb-2 font-medium">/ 100点</div>
               <div className="mb-2 bg-green-400/20 text-green-300 px-2 py-1 rounded text-sm font-bold flex items-center">
                 <TrendingUp size={14} className="mr-1" /> 前週比 +{(analysis.score - 65) > 0 ? (analysis.score - 65) : 0}%
               </div>
             </div>

             {/* Mini Sparkline Chart */}
             <div className="h-16 w-full mt-4">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="2"
                    points={pointsString}
                  />
                  {trendPoints.map((val, i) => {
                     const x = (i / (trendPoints.length - 1)) * 100;
                     const y = 100 - ((val - 0) / (100 - 0)) * 100;
                     return <circle key={i} cx={x} cy={y} r="2" fill="white" />;
                  })}
                </svg>
             </div>
           </div>
        </div>

        {/* Engagement & Risk */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm font-bold uppercase tracking-wider">
               <Heart className="text-pink-500" size={16} /> エンゲージメント
             </div>
             <div className="text-3xl font-bold text-gray-900">{analysis.positivesCount} <span className="text-sm text-gray-400 font-normal">件のポジティブ</span></div>
           </div>
           <div className="mt-4">
             <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
               <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${Math.min(analysis.positivesCount * 10, 100)}%` }}></div>
             </div>
             <p className="text-xs text-gray-400">チームの熱量は維持されています</p>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
           <div>
             <div className="flex items-center gap-2 text-gray-500 mb-2 text-sm font-bold uppercase tracking-wider">
               <AlertTriangle className="text-orange-500" size={16} /> 負荷・リスク
             </div>
             <div className="text-3xl font-bold text-gray-900">{analysis.negativesCount} <span className="text-sm text-gray-400 font-normal">件の課題検知</span></div>
           </div>
           <div className="mt-4">
             <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
               <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(analysis.negativesCount * 10, 100)}%` }}></div>
             </div>
             <p className="text-xs text-gray-400">注意が必要なシグナルです</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Coach */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2 font-bold text-gray-700">
              <BrainCircuit size={20} className="text-indigo-600" />
              AI チームコーチング
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Generated by Gemini 2.5</span>
          </div>
          <div className="p-6">
            <div className="flex gap-4 mb-6">
               <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                 <Zap className="text-indigo-600" size={24} />
               </div>
               <div>
                 <h3 className="font-bold text-gray-900">今週のアドバイス</h3>
                 <p className="text-gray-600 text-sm leading-relaxed mt-1">
                   {analysis.advice}
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-1">
                  <TrendingUp size={14} /> Keep (続けるべきこと)
                </h4>
                <ul className="text-sm text-green-900 space-y-1 list-disc list-inside">
                  {analysis.keeps.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-1">
                  <AlertTriangle size={14} /> Problem (懸念点)
                </h4>
                <ul className="text-sm text-orange-900 space-y-1 list-disc list-inside">
                  {analysis.problems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Buzz Words */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
            <MessageSquareQuote size={18} className="text-gray-400" />
            話題のキーワード
          </div>
          <div className="p-6 flex-1 flex flex-wrap content-start gap-3">
             {analysis.keywords.map((item, idx) => (
               <div 
                 key={idx} 
                 className={`px-3 py-1.5 rounded-full border text-sm flex items-center gap-2 ${
                   idx === 0 ? 'bg-blue-600 text-white border-blue-600 text-lg px-4 py-2' :
                   idx === 1 ? 'bg-blue-50 text-blue-800 border-blue-200' :
                   'bg-white text-gray-600 border-gray-200'
                 }`}
               >
                 <span># {item.word}</span>
                 {item.trend === 'up' && <ArrowUpRight size={12} className={idx === 0 ? 'text-blue-200' : 'text-green-500'} />}
               </div>
             ))}
             <p className="text-xs text-gray-400 w-full mt-4 text-center">
               ※ 直近の投稿・会議ログからAIが自動抽出
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
