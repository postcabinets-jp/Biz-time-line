
import React, { useState } from 'react';
import { FileText, RefreshCw, Download, Calendar, Sparkles } from 'lucide-react';
import { Post } from '../types';
import { generateWeeklyReport } from '../services/geminiService';

interface ReportGeneratorProps {
  posts: Post[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ posts }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateWeeklyReport(posts);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">週次業務レポート作成</h2>
          <p className="text-gray-500">チームの投稿活動からAIが自動的に週報を生成します。</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {loading ? '生成中...' : 'レポートを生成'}
        </button>
      </div>

      {!report && !loading && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
           <div className="bg-blue-50 p-4 rounded-full mb-4">
             <FileText size={32} className="text-blue-500" />
           </div>
           <h3 className="text-lg font-medium text-gray-900">レポートはまだありません</h3>
           <p className="text-gray-500 max-w-md mt-2">右上のボタンをクリックして、直近の投稿を分析し、進捗・課題・成果のサマリーを作成してください。</p>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
          <p className="text-gray-500 text-sm">{posts.length}件の投稿を分析中...</p>
        </div>
      )}

      {report && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
             <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span className="font-medium text-sm">{new Date().toLocaleDateString('ja-JP')} の週</span>
             </div>
             <button className="text-gray-500 hover:text-blue-600 transition-colors" title="PDFダウンロード (デモ)">
                <Download size={20} />
             </button>
          </div>
          <div className="p-8 prose prose-blue max-w-none">
             <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
               {report}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
