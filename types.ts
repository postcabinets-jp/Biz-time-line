
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  department: string;
  role: string;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface AITask {
  id: string; // Added unique ID
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  assigneeSuggestion: string;
  isCompleted: boolean; // Added status
}

export interface AIKnowledge {
  title: string;
  category: 'FAQ' | 'How-To' | 'Best Practice';
  content: string;
}

// 保存されたナレッジアイテム用
export interface KnowledgeItem extends AIKnowledge {
  id: string;
  sourcePostId: string;
  savedAt: string;
}

export interface AIAnalysisResult {
  tasks: AITask[];
  knowledge: AIKnowledge[];
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Urgent';
}

export interface Post {
  id: string;
  user: User;
  caption: string;
  imageUrl: string;
  likes: number;
  comments: Comment[];
  hashtags: string[];
  createdAt: string;
  aiAnalysis?: AIAnalysisResult | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'feed' | 'reports' | 'profile' | 'knowledge' | 'tasks' | 'chat';
