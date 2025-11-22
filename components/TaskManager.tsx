
import React from 'react';
import { CheckCircle, Circle, AlertCircle, Filter, CheckSquare, Video, MessageSquare } from 'lucide-react';
import { Post, Meeting } from '../types';

interface TaskManagerProps {
  posts: Post[];
  meetings: Meeting[];
  onToggleTask: (sourceId: string, taskId: string, source: 'post' | 'meeting') => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ posts, meetings, onToggleTask }) => {
  
  // Aggregate tasks from Posts
  const postTasks = posts.flatMap(post => {
    if (!post.aiAnalysis?.tasks) return [];
    return post.aiAnalysis.tasks.map(task => ({
      ...task,
      sourceType: 'post',
      sourceName: post.user.name,
      sourceAvatar: post.user.avatar,
      date: post.createdAt
    }));
  });

  // Aggregate tasks from Meetings
  const meetingTasks = meetings.flatMap(meeting => {
    if (!meeting.minutes?.tasks) return [];
    return meeting.minutes.tasks.map(task => ({
      ...task,
      sourceType: 'meeting',
      sourceName: meeting.title,
      sourceAvatar: null, // Use icon for meeting
      date: meeting.date
    }));
  });

  const allTasks = [...postTasks, ...meetingTasks].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const [filter, setFilter] = React.useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = allTasks.filter(task => {
    if (filter === 'pending') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  const pendingCount = allTasks.filter(t => !t.isCompleted).length;
  const completedCount = allTasks.filter(t => t.isCompleted).length;

  const translatePriority = (p: string) => {
    switch(p) {
      case 'High': return '高';
      case 'Medium': return '中';
      case 'Low': return '低';
      default: return p;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">統合タスク管理</h2>
          <p className="text-gray-500">投稿や会議から自動抽出されたタスクを一元管理します。</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
           <button 
             onClick={() => setFilter('all')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
           >
             すべて ({allTasks.length})
           </button>
           <button 
             onClick={() => setFilter('pending')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
           >
             未完了 ({pendingCount})
           </button>
           <button 
             onClick={() => setFilter('completed')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
           >
             完了済み ({completedCount})
           </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 && (
           <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed">
             タスクがありません。
           </div>
        )}
        
        {filteredTasks.map((task) => (
          <div 
            key={task.id} 
            className={`bg-white p-5 rounded-xl border transition-all flex gap-4 hover:shadow-md ${
              task.isCompleted ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200'
            }`}
          >
            <button 
              onClick={() => onToggleTask(task.sourceId, task.id, task.source as 'post' | 'meeting')}
              className={`mt-1 shrink-0 transition-colors ${task.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
            >
              {task.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
            </button>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className={`font-semibold text-lg ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                  task.priority === 'High' ? 'bg-red-100 text-red-700' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  優先度: {translatePriority(task.priority)}
                </span>
              </div>
              
              <p className={`text-sm mb-3 ${task.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                 <div className="flex items-center gap-1.5">
                   {task.sourceType === 'post' ? (
                     <>
                       <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                         <img src={task.sourceAvatar || ''} alt="avatar" className="w-full h-full object-cover" />
                       </div>
                       <MessageSquare size={14} className="text-blue-400" />
                       <span>投稿: {task.sourceName}</span>
                     </>
                   ) : (
                     <>
                       <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                         <Video size={12} className="text-indigo-600"/>
                       </div>
                       <span>会議: {task.sourceName}</span>
                     </>
                   )}
                 </div>
                 {task.assigneeSuggestion && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      担当候補: {task.assigneeSuggestion}
                    </span>
                 )}
                 <span className="ml-auto text-gray-400">{new Date(task.date).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
