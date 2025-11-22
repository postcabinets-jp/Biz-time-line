
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PostCard } from './components/PostCard';
import { ReportGenerator } from './components/ReportGenerator';
import { CreatePostModal } from './components/CreatePostModal';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AIAgentChat } from './components/AIAgentChat';
import { TaskManager } from './components/TaskManager';
import { Post, ViewState, KnowledgeItem, AIKnowledge, ChatMessage } from './types';
import { INITIAL_POSTS, CURRENT_USER } from './constants';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  
  // Global Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'こんにちは！BizAgentです。\n社内のタスク抽出、ナレッジの検索、投稿内容の要約などをお手伝いします。\n何かお困りのことはありますか？' }
  ]);

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleSaveKnowledge = (item: AIKnowledge, postId: string) => {
    const newItem: KnowledgeItem = {
      ...item,
      id: Date.now().toString(),
      sourcePostId: postId,
      savedAt: new Date().toISOString()
    };
    setKnowledgeItems([newItem, ...knowledgeItems]);
  };

  const handleToggleTask = (postId: string, taskId: string) => {
    setPosts(posts.map(post => {
      if (post.id !== postId || !post.aiAnalysis) return post;
      
      const updatedTasks = post.aiAnalysis.tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, isCompleted: !task.isCompleted };
        }
        return task;
      });

      return {
        ...post,
        aiAnalysis: {
          ...post.aiAnalysis,
          tasks: updatedTasks
        }
      };
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'feed':
        return (
          <div className="max-w-2xl mx-auto">
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUpdatePost={handleUpdatePost}
                onSaveKnowledge={handleSaveKnowledge}
                onToggleTask={handleToggleTask}
              />
            ))}
          </div>
        );
      case 'tasks':
        return <TaskManager posts={posts} onToggleTask={handleToggleTask} />;
      case 'knowledge':
        return <KnowledgeBase items={knowledgeItems} posts={posts} />;
      case 'reports':
        return <ReportGenerator posts={posts} />;
      case 'chat':
        return (
          <AIAgentChat 
            variant="page" 
            isOpen={true} 
            posts={posts} 
            knowledge={knowledgeItems}
            messages={chatMessages}
            setMessages={setChatMessages}
          />
        );
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                <img src={CURRENT_USER.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-blue-50" alt="profile" />
                <h2 className="text-2xl font-bold text-gray-900">{CURRENT_USER.name}</h2>
                <p className="text-blue-600 font-medium">{CURRENT_USER.role} • {CURRENT_USER.department}</p>
                <p className="mt-4 text-gray-600">
                  プロフィール設定と個人の活動分析機能はここに実装予定です。
                </p>
            </div>
          </div>
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView} 
        onChangeView={setCurrentView}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onToggleAgent={() => setIsAgentOpen(!isAgentOpen)}
        isAgentOpen={isAgentOpen}
      >
        {renderContent()}
      </Layout>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onCreate={handleCreatePost}
      />

      {/* The floating chat modal - only show if not in full page chat mode */}
      {currentView !== 'chat' && (
        <AIAgentChat 
          variant="modal"
          isOpen={isAgentOpen}
          onClose={() => setIsAgentOpen(false)}
          posts={posts}
          knowledge={knowledgeItems}
          messages={chatMessages}
          setMessages={setChatMessages}
        />
      )}
    </>
  );
}

export default App;
