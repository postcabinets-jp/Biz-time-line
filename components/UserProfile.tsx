
import React, { useState } from 'react';
import { User, Mail, Briefcase, MapPin, Grid, CheckSquare, Book, Edit3 } from 'lucide-react';
import { Post, KnowledgeItem, AITask, User as UserType } from '../types';
import { PostCard } from './PostCard';

interface UserProfileProps {
  user: UserType;
  posts: Post[];
  tasks: any[]; // Using aggregated tasks from TaskManager logic would be ideal, but simplifying for now
  knowledge: KnowledgeItem[];
  onUpdatePost: (post: Post) => void;
  onSaveKnowledge: (item: any, postId: string) => void;
  onToggleTask: (sourceId: string, taskId: string, source: 'post' | 'meeting') => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  posts, 
  tasks, // Expected to be passed from parent as aggregated tasks
  knowledge,
  onUpdatePost,
  onSaveKnowledge,
  onToggleTask
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'tasks' | 'knowledge'>('posts');

  // Filter data for current user
  const userPosts = posts.filter(p => p.user.id === user.id);
  const userTasks = tasks.filter(t => !t.isCompleted); // Show pending tasks assigned to me (mock logic: showing all pending for demo)
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-8 pb-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-4">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white"
            />
            <div className="flex-1 pt-2 md:pt-0">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.role} @ {user.department}</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors">
                <Edit3 size={16} /> プロフィール編集
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <span>{user.username}@company.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-gray-400" />
              <span>{user.department} / {user.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span>東京本社 12F</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Posts</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-900">{userTasks.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Pending Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-gray-900">{knowledge.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Saved Items</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'posts' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid size={18} />
            最近の投稿
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tasks' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckSquare size={18} />
            担当タスク
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'knowledge' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Book size={18} />
            保存済みナレッジ
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div>
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">投稿がまだありません</div>
            ) : (
              userPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onUpdatePost={onUpdatePost}
                  onSaveKnowledge={onSaveKnowledge}
                  onToggleTask={(pid, tid) => onToggleTask(pid, tid, 'post')}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
             {userTasks.length === 0 ? (
               <div className="text-center py-10 text-gray-500">未完了のタスクはありません</div>
             ) : (
               userTasks.map(task => (
                 <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                         <span className={`px-2 py-0.5 rounded bg-gray-100 ${task.priority === 'High' ? 'text-red-600 bg-red-50' : ''}`}>
                           {task.priority}
                         </span>
                         <span>{new Date(task.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onToggleTask(task.sourceId, task.id, task.sourceType)}
                      className="text-gray-300 hover:text-green-500"
                    >
                      <CheckSquare size={24} />
                    </button>
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledge.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{item.category}</span>
                <h4 className="font-bold text-gray-800 mt-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">{item.content}</p>
              </div>
            ))}
             {knowledge.length === 0 && (
               <div className="col-span-full text-center py-10 text-gray-500">保存されたナレッジはありません</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
