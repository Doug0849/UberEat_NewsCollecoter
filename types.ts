export enum Category {
  DEFENSIVE = 'DEFENSIVE', // Brand monitoring, negative news
  OFFENSIVE = 'OFFENSIVE', // Competitor moves
  MACRO = 'MACRO',         // Market trends, regulations
  SOCIAL = 'SOCIAL'        // IG/Threads trends
}

export interface AnalysisResult {
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  actionTip: string;
  keywords: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string; // ISO date string
  url: string;
  snippet: string;
  category: Category;
  analyzed: boolean;
  analysis?: AnalysisResult;
}

export interface KeywordConfig {
  id: string;
  term: string;
  category: Category;
}

// Mock data types for chart
export interface SentimentData {
  name: string;
  value: number;
  color: string;
}