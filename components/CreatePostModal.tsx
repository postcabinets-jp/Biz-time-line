
import React, { useState } from 'react';
import { X, Image as ImageIcon, Smile, Send } from 'lucide-react';
import { CURRENT_USER } from '../constants';
import { Post } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!caption.trim()) return;
    
    setIsSubmitting(true);
    
    // Mock API delay
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now().toString(),
        user: CURRENT_USER,
        caption: caption,
        // Random image for demo
        imageUrl: `https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80`,
        likes: 0,
        comments: [],
        hashtags: [], // Mock
        createdAt: new Date().toISOString(),
      };
      
      onCreate(newPost);
      setCaption('');
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-800">新規投稿を作成</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex space-x-3 mb-4">
            <img src={CURRENT_USER.avatar} alt="Me" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
               <span className="font-semibold text-sm text-gray-900 block">{CURRENT_USER.name}</span>
               <span className="text-xs text-gray-500">フィードへの投稿</span>
            </div>
          </div>
          
          <textarea 
            className="w-full h-32 p-2 text-gray-700 placeholder-gray-400 focus:outline-none resize-none text-lg"
            placeholder="今どのような業務に取り組んでいますか？"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            autoFocus
          />
          
          <div className="border border-gray-200 rounded-xl p-3 mb-4 bg-gray-50 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <div className="flex flex-col items-center gap-1">
               <ImageIcon size={24} />
               <span className="text-xs font-medium">写真を追加 (デモ用に自動生成されます)</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2 text-gray-400">
               <button className="hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full"><ImageIcon size={20} /></button>
               <button className="hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full"><Smile size={20} /></button>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={!caption.trim() || isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
            >
              <span>{isSubmitting ? '投稿中...' : '投稿する'}</span>
              {!isSubmitting && <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
