
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { PostCard } from './components/PostCard';
import { ReportGenerator } from './components/ReportGenerator';
import { CreatePostModal } from './components/CreatePostModal';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AIAgentChat } from './components/AIAgentChat';
import { TaskManager } from './components/TaskManager';
import { MeetingRoom } from './components/MeetingRoom';
import { TeamPulse } from './components/TeamPulse';
import { UserProfile } from './components/UserProfile';
import { Post, ViewState, KnowledgeItem, AIKnowledge, ChatMessage, Meeting, Notification } from './types';
import { INITIAL_POSTS, INITIAL_MEETINGS, INITIAL_NOTIFICATIONS, CURRENT_USER } from './constants';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  
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

  // Unified Task Toggling
  const handleToggleTask = (sourceId: string, taskId: string, source: 'post' | 'meeting' = 'post') => {
    if (source === 'post') {
      setPosts(posts.map(post => {
        if (post.id !== sourceId || !post.aiAnalysis) return post;
        const updatedTasks = post.aiAnalysis.tasks.map(task => {
          if (task.id === taskId) return { ...task, isCompleted: !task.isCompleted };
          return task;
        });
        return { ...post, aiAnalysis: { ...post.aiAnalysis, tasks: updatedTasks } };
      }));
    } else if (source === 'meeting') {
      setMeetings(meetings.map(meeting => {
        if (meeting.id !== sourceId || !meeting.minutes) return meeting;
        const updatedTasks = meeting.minutes.tasks.map(task => {
          if (task.id === taskId) return { ...task, isCompleted: !task.isCompleted };
          return task;
        });
        return { ...meeting, minutes: { ...meeting.minutes, tasks: updatedTasks } };
      }));
    }
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    setMeetings([newMeeting, ...meetings]);
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    setMeetings(meetings.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
  };
  
  // Helper to aggregate tasks for profile
  const getAllTasks = () => {
    const postTasks = posts.flatMap(post => {
      if (!post.aiAnalysis?.tasks) return [];
      return post.aiAnalysis.tasks.map(task => ({
        ...task,
        sourceType: 'post',
        sourceId: post.id,
        date: post.createdAt
      }));
    });
    const meetingTasks = meetings.flatMap(meeting => {
      if (!meeting.minutes?.tasks) return [];
      return meeting.minutes.tasks.map(task => ({
        ...task,
        sourceType: 'meeting',
        sourceId: meeting.id,
        date: meeting.date
      }));
    });
    return [...postTasks, ...meetingTasks];
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
                onToggleTask={(pid, tid) => handleToggleTask(pid, tid, 'post')}
              />
            ))}
          </div>
        );
      case 'tasks':
        return <TaskManager posts={posts} meetings={meetings} onToggleTask={handleToggleTask} />;
      case 'knowledge':
        return <KnowledgeBase items={knowledgeItems} posts={posts} />;
      case 'reports':
        return <ReportGenerator posts={posts} meetings={meetings} />;
      case 'meetings':
        return <MeetingRoom meetings={meetings} onAddMeeting={handleAddMeeting} onUpdateMeeting={handleUpdateMeeting} />;
      case 'pulse':
        return <TeamPulse posts={posts} meetings={meetings} />;
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
          <UserProfile 
            user={CURRENT_USER} 
            posts={posts} 
            tasks={getAllTasks()} 
            knowledge={knowledgeItems}
            onUpdatePost={handleUpdatePost}
            onSaveKnowledge={handleSaveKnowledge}
            onToggleTask={handleToggleTask}
          />
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView} 
        currentUser={CURRENT_USER}
        notifications={notifications}
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
