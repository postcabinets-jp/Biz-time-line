
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, Post, KnowledgeItem, ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a single post to extract tasks, knowledge, and insights.
 */
export const analyzePostWithAI = async (post: Post): Promise<AIAnalysisResult> => {
  const modelId = 'gemini-2.5-flash';

  const prompt = `
    あなたは日本の企業の優秀なAIアシスタントです。以下の社内SNSの投稿を分析してください。
    
    投稿内容: "${post.caption}"
    投稿者: ${post.user.name} (${post.user.department} / ${post.user.role})
    
    以下の情報を抽出し、JSON形式で出力してください。全てのテキストは自然な日本語で記述してください。
    
    1. 'tasks': テキストから読み取れる具体的なアクションアイテム（タスク）。
       - title: タスク名（簡潔に）
       - description: 詳細説明
       - priority: 'High'(高), 'Medium'(中), 'Low'(低) のいずれか
       - assigneeSuggestion: 文脈から推測される担当者または部署（不明な場合は「未定」）
    2. 'knowledge': 全社的に共有すべき知見やルール（FAQ、手順、ベストプラクティス）。
       - title: タイトル
       - category: 'FAQ', 'How-To', 'Best Practice' のいずれか
       - content: 内容の要約
    3. 'summary': 投稿のビジネス上の価値や要点の1行要約。
    4. 'sentiment': 'Positive'(ポジティブ), 'Neutral'(中立), 'Negative'(ネガティブ), 'Urgent'(緊急) のいずれか。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
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
    
    // Post-processing to add IDs and default status to tasks
    const processedResult: AIAnalysisResult = {
      ...result,
      tasks: result.tasks?.map((task: any, index: number) => ({
        ...task,
        id: `task-${Date.now()}-${index}`,
        isCompleted: false
      })) || []
    };

    return processedResult;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};

/**
 * Generates a weekly report based on a list of posts.
 */
export const generateWeeklyReport = async (posts: Post[]): Promise<string> => {
  const modelId = 'gemini-2.5-flash';
  
  const postsText = posts.map(p => 
    `- [${p.createdAt.split('T')[0]}] ${p.user.name} (${p.user.department}): ${p.caption}`
  ).join('\n');

  const prompt = `
    あなたは企業の経営企画担当AIです。以下の社内SNSの投稿一覧をもとに、経営層およびチームリーダー向けの「週次業務レポート」を作成してください。

    【投稿データ】
    ${postsText}

    【出力形式】
    Markdown形式で、以下の構成で記述してください。
    言葉遣いは「です・ます」調の丁寧なビジネス文書としてください。

    # 週次業務ハイライト
    
    ## 1. 主な成果・進捗 (Key Achievements)
    （具体的な成果を箇条書きで）

    ## 2. 課題・リスク (Risks & Issues)
    （注意が必要な点や発生したトラブル）

    ## 3. 部署間連携の状況 (Collaboration)
    （誰と誰が協力しているかなど）

    ## 4. 来週へのアクション (Next Steps)
    （推奨されるアクションアイテム）
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    return response.text || "レポートの生成に失敗しました。";
  } catch (error) {
    console.error("Report generation failed:", error);
    return "API制限または接続エラーによりレポートを生成できませんでした。";
  }
};

/**
 * Chat with the AI Agent using context from posts and knowledge base.
 */
export const chatWithAgent = async (
  message: string, 
  history: ChatMessage[], 
  contextPosts: Post[], 
  contextKnowledge: KnowledgeItem[]
): Promise<string> => {
  const modelId = 'gemini-2.5-flash';

  // Prepare context
  const postsContext = contextPosts.map(p => `投稿者: ${p.user.name} (${p.createdAt}): ${p.caption}`).join('\n');
  const knowledgeContext = contextKnowledge.map(k => `[${k.category}] ${k.title}: ${k.content}`).join('\n');
  
  // Extract all tasks from posts for context
  const allTasks = contextPosts.flatMap(p => 
    p.aiAnalysis?.tasks.map(t => 
      `- [${t.isCompleted ? '完了' : '未完了'}] ${t.title} (優先度: ${t.priority}, 推奨担当: ${t.assigneeSuggestion})`
    ) || []
  ).join('\n');

  const systemInstruction = `
    あなたは社内AIコンサルタント「BizAgent」です。
    社内の投稿フィード、AIが抽出したタスク、保存されたナレッジベースにアクセスできます。
    
    【現在のコンテキスト - 最近の投稿】
    ${postsContext}

    【現在のコンテキスト - 全タスク状況】
    ${allTasks || "タスクはまだ抽出されていません。"}

    【現在のコンテキスト - ナレッジベース】
    ${knowledgeContext || "ナレッジはまだ保存されていません。"}

    【指示】
    - ユーザーの質問に対して、上記のコンテキスト情報を最大限活用して日本語で答えてください。
    - コンテキストにない情報は、「社内データには見当たりませんが」と断った上で、一般的な知識で回答してください。
    - 口調は丁寧なビジネス日本語（です・ます調）を使用してください。
    - 投稿に言及する際は、「〇〇さんの投稿によると」のように誰の情報か明示してください。
    - タスクについて聞かれたら、未完了のものを優先して教えてください。
  `;

  try {
    const conversation = history.map(h => `${h.role === 'user' ? 'User' : 'Model'}: ${h.text}`).join('\n');
    
    const finalPrompt = `
      ${systemInstruction}

      【会話履歴】
      ${conversation}

      User: ${message}
      Model:
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: finalPrompt,
    });

    return response.text || "申し訳ありません、リクエストを処理できませんでした。";

  } catch (error) {
    console.error("Agent chat failed:", error);
    return "現在サーバーに接続できません。しばらく待ってから再試行してください。";
  }
};
