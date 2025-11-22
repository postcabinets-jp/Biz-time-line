
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
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  assigneeSuggestion: string;
  isCompleted: boolean;
  source: 'post' | 'meeting'; // タスクの発生源
  sourceId: string;           // 発生源のID
  sourceTitle?: string;       // 発生源のタイトル（会議名など）
}

export interface AIKnowledge {
  title: string;
  category: 'FAQ' | 'How-To' | 'Best Practice';
  content: string;
}

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

export interface MeetingMinutes {
  summary: string;
  decisions: string[];
  tasks: AITask[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  participants: User[];
  transcript: string; // 会議ログ
  minutes?: MeetingMinutes | null; // AI生成議事録
  isActive: boolean; // 会議中かどうか
  type: 'video' | 'audio'; // 会議タイプ
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface TeamHealthAnalysis {
  score: number;
  keywords: { word: string; count: number; trend: 'up' | 'down' | 'flat' }[];
  advice: string;
  keeps: string[];
  problems: string[];
  positivesCount: number;
  negativesCount: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'mention' | 'task';
  content: string;
  isRead: boolean;
  createdAt: string;
  user: User; // Originator
}

export type ViewState = 'feed' | 'reports' | 'profile' | 'knowledge' | 'tasks' | 'chat' | 'meetings' | 'pulse';
