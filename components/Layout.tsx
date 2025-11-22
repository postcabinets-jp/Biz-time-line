
import React, { useState } from 'react';
import { Home, FileText, User, PlusSquare, Sparkles, LogOut, Book, MessageSquareText, CheckSquare, Video, Activity, Search, Bell, Menu } from 'lucide-react';
import { ViewState, Notification, User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  currentUser: UserType;
  notifications: Notification[];
  onChangeView: (view: ViewState) => void;
  onOpenCreateModal: () => void;
  onToggleAgent: () => void;
  isAgentOpen: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  currentUser,
  notifications,
  onChangeView, 
  onOpenCreateModal, 
  onToggleAgent, 
  isAgentOpen 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm md:text-base">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-[#f3f4f6]">
      {/* Desktop Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 flex flex-col p-6
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center space-x-2 mb-10">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">BizSocial<span className="text-blue-600">AI</span></h1>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
          <NavItem view="feed" icon={Home} label="フィード" />
          <NavItem view="meetings" icon={Video} label="タイムライン会議" />
          <NavItem view="tasks" icon={CheckSquare} label="タスク管理" />
          <NavItem view="knowledge" icon={Book} label="ナレッジベース" />
          <NavItem view="reports" icon={FileText} label="レポート作成" />
          <div className="pt-4 pb-2">
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">AI インサイト</p>
             <NavItem view="pulse" icon={Activity} label="チームパルス" />
             <NavItem view="chat" icon={MessageSquareText} label="AI コンサルタント" />
          </div>
          
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

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="投稿、タスク、ナレッジを検索..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl w-64 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              )}
            </button>
            
            <button 
              onClick={() => onChangeView('profile')}
              className="flex items-center gap-2 hover:bg-gray-50 pr-3 py-1 rounded-full transition-all"
            >
              <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full border border-gray-200" />
              <span className="text-sm font-medium text-gray-700 hidden md:block">{currentUser.name}</span>
            </button>
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
          {children}
        </main>

        {/* FAB for AI Agent */}
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
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-4 z-50 pb-safe">
        <button onClick={() => onChangeView('feed')} className={currentView === 'feed' ? 'text-blue-600' : 'text-gray-400'}>
          <Home size={24} />
        </button>
        <button onClick={() => onChangeView('meetings')} className={currentView === 'meetings' ? 'text-blue-600' : 'text-gray-400'}>
          <Video size={24} />
        </button>
        <button onClick={onOpenCreateModal} className="text-blue-600">
          <PlusSquare size={32} />
        </button>
        <button onClick={() => onChangeView('tasks')} className={currentView === 'tasks' ? 'text-blue-600' : 'text-gray-400'}>
          <CheckSquare size={24} />
        </button>
        <button onClick={() => onChangeView('chat')} className={currentView === 'chat' ? 'text-blue-600' : 'text-gray-400'}>
          <MessageSquareText size={24} />
        </button>
      </nav>
    </div>
  );
};
