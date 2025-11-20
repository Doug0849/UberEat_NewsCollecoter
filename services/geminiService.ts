import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, NewsItem, Category } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeNewsItem = async (title: string, snippet: string): Promise<AnalysisResult> => {
  // Fallback if no key provided in demo environment
  if (!apiKey) {
    console.warn("No API Key found. Returning mock analysis.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "AI 分析服務暫不可用 (缺少 API Key)。",
          sentiment: "NEUTRAL",
          actionTip: "請設定您的 Gemini API Key 以解鎖即時洞察功能。",
          keywords: ["Demo", "No Key"]
        });
      }, 1500);
    });
  }

  const prompt = `
    你是一位專門服務餐飲外送平台客戶經理 (Account Manager) 的情報分析專家。
    請分析以下新聞標題與摘要。
    
    標題: "${title}"
    摘要: "${snippet}"

    請提供以下資訊 (必須使用繁體中文 Traditional Chinese 回答):
    1. 一句話總結重點 (summary)。
    2. 情緒判斷 (sentiment): POSITIVE, NEGATIVE, 或 NEUTRAL。
    3. 給 AM 的行動建議 (actionTip): 針對此新聞，AM 該如何與客戶溝通或內部應對？
    4. 兩個關鍵字標籤 (keywords)。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
            actionTip: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "sentiment", "actionTip", "keywords"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "分析失敗，請稍後再試。",
      sentiment: "NEUTRAL",
      actionTip: "請人工確認來源。",
      keywords: ["Error"]
    };
  }
};

export const fetchLiveNews = async (keywords: string[]): Promise<NewsItem[]> => {
  if (!apiKey) {
    console.warn("No API Key found for live search.");
    return [];
  }

  // Construct a focused query using ALL keywords to ensure user settings are respected.
  // We rely on Gemini to interpret the list and form appropriate queries.
  const queryTerms = keywords.join(', ');
  const prompt = `
    請使用 Google Search 搜尋台灣關於以下主題的最新新聞 (過去 24-48 小時): 
    
    ${queryTerms}
    
    請挑選 3-5 則最相關且重要的新聞。
    請將結果整理為一個純 JSON 陣列 (Array of Objects)，不要使用 Markdown code block，直接回傳 JSON 字串。
    
    每個物件必須包含以下欄位:
    - title: 新聞標題
    - source: 媒體來源名稱 (例如: 聯合新聞網, 數位時代)
    - snippet: 簡短摘要 (50字以內)
    
    注意: 不需要 'date' 或 'url' 欄位，我會從其他地方取得。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType JSON is not supported with tools usually, so we parse text manually
      }
    });

    const text = response.text;
    if (!text) return [];

    // Attempt to parse JSON from the text response
    // Remove potential markdown formatting if the model adds it
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let parsedItems: any[] = [];
    
    try {
      parsedItems = JSON.parse(cleanText);
    } catch (e) {
      console.warn("Failed to parse JSON from search result, trying regex fallback or empty.");
      // Fallback: try to extract objects if array structure is broken
      return [];
    }

    if (!Array.isArray(parsedItems)) return [];

    // Extract Grounding Metadata for URLs
    // The groundingChunks contains the Web Search results.
    // We try to map them roughly by order or just assign available links.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webChunks = groundingChunks.filter(c => c.web?.uri);

    return parsedItems.map((item, index) => {
      // Try to find a matching URL from chunks, or fallback to the i-th chunk
      const matchingChunk = webChunks[index] || webChunks[0];
      
      return {
        id: `search-${Date.now()}-${index}`,
        title: item.title || '無標題',
        source: item.source || 'Google Search',
        date: new Date().toISOString(),
        url: matchingChunk?.web?.uri || '#',
        snippet: item.snippet || '點擊連結查看詳情',
        category: Category.MACRO, // Default to Macro/Market for search results
        analyzed: false
      };
    });

  } catch (error) {
    console.error("Live Search Failed:", error);
    return [];
  }
};