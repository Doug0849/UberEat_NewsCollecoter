import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

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