
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Post, KnowledgeItem, ChatMessage, Meeting, MeetingMinutes, TeamHealthAnalysis } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_ID = 'gemini-2.5-flash';

/**
 * Analyzes a single post to extract tasks, knowledge, and insights.
 */
export const analyzePostWithAI = async (post: Post): Promise<AIAnalysisResult> => {
  const prompt = `
    以下の社内SNS投稿を分析し、タスク、ナレッジ、要約、感情を抽出してください。
    
    投稿: "${post.caption}"
    投稿者: ${post.user.name} (${post.user.department})
    
    JSON形式で出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  assigneeSuggestion: { type: Type.STRING }
                }
              }
            },
            knowledge: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['FAQ', 'How-To', 'Best Practice'] },
                  content: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Urgent'] }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    return {
      ...result,
      tasks: result.tasks?.map((task: any, index: number) => ({
        ...task,
        id: `post-task-${post.id}-${index}`,
        isCompleted: false,
        source: 'post',
        sourceId: post.id
      })) || []
    };

  } catch (error) {
    console.error("Post analysis failed:", error);
    throw error;
  }
};

/**
 * Analyzes meeting transcript to generate minutes and tasks.
 */
export const analyzeMeetingWithAI = async (meeting: Meeting): Promise<MeetingMinutes> => {
  const prompt = `
    あなたはプロの議事録作成AIです。以下の会議ログから、議事録（要約、決定事項、タスク）を作成してください。
    
    会議名: ${meeting.title}
    ログ:
    ${meeting.transcript}
    
    JSON形式で出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "会議全体の要約" },
            decisions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "決定事項のリスト" },
            sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  assigneeSuggestion: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);

    return {
      ...result,
      tasks: result.tasks?.map((task: any, index: number) => ({
        ...task,
        id: `meeting-task-${meeting.id}-${index}`,
        isCompleted: false,
        source: 'meeting',
        sourceId: meeting.id,
        sourceTitle: meeting.title
      })) || []
    };

  } catch (error) {
    console.error("Meeting analysis failed:", error);
    throw error;
  }
};

/**
 * Analyzes team health based on posts and meetings.
 */
export const analyzeTeamHealth = async (posts: Post[], meetings: Meeting[]): Promise<TeamHealthAnalysis> => {
  const postsText = posts.map(p => `[投稿] ${p.caption} (感情: ${p.aiAnalysis?.sentiment || '不明'})`).join('\n');
  const meetingsText = meetings.map(m => `[会議] ${m.title}: ${m.minutes?.summary || 'なし'}`).join('\n');

  const prompt = `
    あなたは組織コンサルタントAIです。以下の社内データからチームの健全性を診断してください。

    【データ】
    ${postsText}
    ${meetingsText}

    以下の項目をJSONで出力してください：
    1. score: 0-100の健全性スコア
    2. keywords: 話題になっているキーワード5選（trendはup/down/flat）
    3. advice: マネージャーへの具体的なアドバイス（150文字以内）
    4. keeps: 良い点・続けるべきこと（2つ）
    5. problems: 懸念点・課題（2つ）
    6. positivesCount: 推定されるポジティブな反応の総数
    7. negativesCount: 推定されるネガティブ・緊急な反応の総数
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'flat'] }
                }
              }
            },
            advice: { type: Type.STRING },
            keeps: { type: Type.ARRAY, items: { type: Type.STRING } },
            problems: { type: Type.ARRAY, items: { type: Type.STRING } },
            positivesCount: { type: Type.NUMBER },
            negativesCount: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as TeamHealthAnalysis;
  } catch (error) {
    console.error("Team pulse analysis failed:", error);
    // Return fallback data
    return {
      score: 70,
      keywords: [{ word: "分析エラー", count: 0, trend: "flat" }],
      advice: "データの分析に失敗しました。しばらく待ってから再試行してください。",
      keeps: [],
      problems: [],
      positivesCount: 0,
      negativesCount: 0
    };
  }
};

/**
 * Generates a weekly report based on posts AND meetings.
 */
export const generateWeeklyReport = async (posts: Post[], meetings: Meeting[]): Promise<string> => {
  const postsText = posts.map(p => 
    `- [投稿] ${p.user.name}: ${p.caption}`
  ).join('\n');

  const meetingsText = meetings.map(m => 
    `- [会議] ${m.title}: ${m.minutes ? m.minutes.summary : '議事録なし'}`
  ).join('\n');

  const prompt = `
    あなたは企業の経営企画担当AIです。
    以下の「社内SNS投稿」と「会議議事録」をもとに、今週の活動を総括する「週次業務レポート」を作成してください。

    【投稿データ】
    ${postsText}

    【会議データ】
    ${meetingsText}

    【出力形式】
    Markdown形式で、以下の構成で記述してください。
    
    # 週次業務ハイライト
    ## 1. エグゼクティブサマリー
    ## 2. プロジェクト進捗と決定事項
    ## 3. 発生した課題と対応
    ## 4. 来週のアクションプラン
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
    });
    return response.text || "レポート生成失敗";
  } catch (error) {
    return "APIエラーによりレポートを生成できませんでした。";
  }
};

/**
 * Chat with Agent
 */
export const chatWithAgent = async (
  message: string, 
  history: ChatMessage[], 
  contextPosts: Post[], 
  contextKnowledge: KnowledgeItem[]
): Promise<string> => {
  const postsContext = contextPosts.slice(0, 10).map(p => `投稿(${p.user.name}): ${p.caption}`).join('\n');
  const knowledgeContext = contextKnowledge.map(k => `ナレッジ(${k.title}): ${k.content}`).join('\n');

  const systemInstruction = `
    あなたは社内AIコンサルタント「BizAgent」です。
    以下のコンテキストを活用して回答してください。
    
    [最近の投稿]
    ${postsContext}
    
    [ナレッジ]
    ${knowledgeContext}
  `;

  try {
    const conversation = history.map(h => `${h.role === 'user' ? 'User' : 'Model'}: ${h.text}`).join('\n');
    const finalPrompt = `${systemInstruction}\n\n${conversation}\nUser: ${message}\nModel:`;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: finalPrompt,
    });

    return response.text || "エラーが発生しました。";
  } catch (error) {
    return "接続エラーが発生しました。";
  }
};
