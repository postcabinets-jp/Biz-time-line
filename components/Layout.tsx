
import React from 'react';
import { Home, FileText, User, PlusSquare, Sparkles, LogOut, Book, MessageSquareText, CheckSquare } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onOpenCreateModal: () => void;
  onToggleAgent: () => void;
  isAgentOpen: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onOpenCreateModal, onToggleAgent, isAgentOpen }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm md:text-base hidden md:block">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen p-6">
        <div className="flex items-center space-x-2 mb-10">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">BizSocial<span className="text-blue-600">AI</span></h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem view="feed" icon={Home} label="フィード" />
          <NavItem view="tasks" icon={CheckSquare} label="タスク管理" />
          <NavItem view="knowledge" icon={Book} label="ナレッジベース" />
          <NavItem view="reports" icon={FileText} label="レポート作成" />
          <div className="pt-4 pb-2">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">AI ツール</p>
             <NavItem view="chat" icon={MessageSquareText} label="AI コンサルタント" />
          </div>
          <NavItem view="profile" icon={User} label="プロフィール" />
          
          <button 
             onClick={onOpenCreateModal}
             className="mt-6 w-full bg-blue-50 text-blue-600 border-2 border-blue-200 hover:bg-blue-100 p-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <PlusSquare size={20} />
            <span>投稿する</span>
          </button>
        </nav>

        <div className="pt-6 border-t border-gray-100">
           <button className="flex items-center space-x-3 text-gray-500 hover:text-red-500 transition-colors w-full p-2">
              <LogOut size={20} />
              <span className="font-medium">ログアウト</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto md:px-8 py-6 pb-24 md:pb-6 relative">
        {children}
        
        {/* FAB for AI Agent (Only show if not on chat page already) */}
        {currentView !== 'chat' && (
          <button 
            onClick={onToggleAgent}
            className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 p-4 rounded-full shadow-xl transition-all hover:scale-105 z-40 group flex items-center gap-2 ${
              isAgentOpen 
                ? 'bg-gray-800 text-white hover:bg-gray-900' 
                : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
            }`}
          >
            {isAgentOpen ? <MessageSquareText size={24} /> : <Sparkles size={24} />}
             <span className={`max-w-0 overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap font-medium ${!isAgentOpen ? 'group-hover:max-w-xs' : ''}`}>
               {isAgentOpen ? 'チャットを閉じる' : 'AIに相談'}
             </span>
          </button>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-4 z-50 pb-safe">
        <button onClick={() => onChangeView('feed')} className={currentView === 'feed' ? 'text-blue-600' : 'text-gray-400'}>
          <Home size={24} />
        </button>
        <button onClick={() => onChangeView('tasks')} className={currentView === 'tasks' ? 'text-blue-600' : 'text-gray-400'}>
          <CheckSquare size={24} />
        </button>
        <button onClick={onOpenCreateModal} className="text-blue-600">
          <PlusSquare size={32} />
        </button>
        <button onClick={() => onChangeView('chat')} className={currentView === 'chat' ? 'text-blue-600' : 'text-gray-400'}>
          <MessageSquareText size={24} />
        </button>
        <button onClick={() => onChangeView('profile')} className={currentView === 'profile' ? 'text-blue-600' : 'text-gray-400'}>
          <User size={24} />
        </button>
      </nav>
    </div>
  );
};
