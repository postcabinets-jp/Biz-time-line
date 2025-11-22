
import React from 'react';
import { Folder, Book, Clock, ExternalLink, Search, Hash } from 'lucide-react';
import { KnowledgeItem, Post } from '../types';

interface KnowledgeBaseProps {
  items: KnowledgeItem[];
  posts: Post[]; // To link back to source
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ items, posts }) => {
  const categories = ['All', 'FAQ', 'How-To', 'Best Practice'];
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSourcePost = (sourceId: string) => posts.find(p => p.id === sourceId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ナレッジストックフォルダ</h2>
          <p className="text-gray-500">AIが抽出した社内の知見・ノウハウを一元管理するリポジトリです。</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="ナレッジを検索..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Categories / Folders */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {activeCategory === cat ? <Folder size={16} fill="currentColor" /> : <Folder size={16} />}
            {cat === 'All' ? 'すべて' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <Book size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">ナレッジアイテムがありません。</p>
            <p className="text-sm text-gray-400">フィードの投稿をAI分析し、「ナレッジベースに保存」ボタンを押すとここに追加されます。</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const source = getSourcePost(item.sourcePostId);
            return (
              <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold tracking-wide uppercase ${
                    item.category === 'FAQ' ? 'bg-purple-100 text-purple-700' :
                    item.category === 'How-To' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(item.savedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">
                  {item.content}
                </p>

                {source && (
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <img src={source.user.avatar} className="w-5 h-5 rounded-full" alt="author" />
                    <span>元投稿: {source.user.name}</span>
                    <button className="ml-auto text-blue-600 hover:underline flex items-center gap-1">
                      <ExternalLink size={12} /> 投稿を見る
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
