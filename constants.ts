import { Category, NewsItem, KeywordConfig } from './types';

export const MOCK_KEYWORDS: KeywordConfig[] = [
  { id: '1', term: '麥當勞 食安', category: Category.DEFENSIVE },
  { id: '2', term: '肯德基 新口味', category: Category.DEFENSIVE },
  { id: '3', term: '外送平台 法規', category: Category.MACRO },
  { id: '4', term: 'Foodpanda 獨家', category: Category.OFFENSIVE },
  { id: '5', term: '台北米其林', category: Category.OFFENSIVE },
  { id: '6', term: '手搖飲 趨勢', category: Category.SOCIAL },
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: '麥當勞宣布與在地小農合作計畫，目標 2025 達成 80% 生菜在地化',
    source: '數位時代',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    url: '#',
    snippet: '速食龍頭宣布新策略，將大幅增加台灣在地食材採購比例，減少碳足跡並確保新鮮度。',
    category: Category.DEFENSIVE,
    analyzed: true,
    analysis: {
      summary: '麥當勞承諾 2025 年前將在地生菜採購比例提升至 80%。',
      sentiment: 'POSITIVE',
      actionTip: '建議在外送平台專區策劃「在地小農」專題活動，強調新鮮與永續。',
      keywords: ['ESG永續', '供應鏈']
    }
  },
  {
    id: 'n2',
    title: '網友熱議：連鎖炸雞疑似變相漲價，雞腿縮水？',
    source: 'Dcard 美食板',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    url: '#',
    snippet: '多篇熱門文章討論近期知名連鎖店的炸雞尺寸變小，網友反應兩極，部分揚言抵制。',
    category: Category.DEFENSIVE,
    analyzed: false
  },
  {
    id: 'n3',
    title: '競爭對手 X 推出「學生專屬」免運訂閱制',
    source: '科技新報',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    url: '#',
    snippet: '為搶攻開學季商機，平台祭出憑學生證享首月免運及專屬折扣碼。',
    category: Category.OFFENSIVE,
    analyzed: true,
    analysis: {
      summary: '競品針對學生族群推出免運訂閱方案，意圖搶佔年輕市場。',
      sentiment: 'NEGATIVE',
      actionTip: '建議推出「宵夜場」專屬優惠組合，反制其學生客群流失。',
      keywords: ['競品分析', '定價策略']
    }
  },
  {
    id: 'n4',
    title: '勞動部研擬「外送員保險」新制草案，預計下季上路',
    source: '中央社',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    url: '#',
    snippet: '新草案將要求平台業者提高意外險保額，恐影響平台營運成本結構。',
    category: Category.MACRO,
    analyzed: false
  }
];

export const SIMULATED_INCOMING_NEWS: NewsItem[] = [
  {
    id: 'sim1',
    title: '爆紅！漢堡王「隱藏版」疊疊樂漢堡在 TikTok 瘋傳',
    source: '社群監測',
    date: new Date().toISOString(),
    url: '#',
    snippet: '網紅自創的 10 層牛肉堡點法引發挑戰風潮，門市業績暴增。',
    category: Category.SOCIAL,
    analyzed: false
  },
  {
    id: 'sim2',
    title: '食安警報：某進口辣椒粉驗出蘇丹紅，多家餐飲受波及',
    source: 'FDA 公告',
    date: new Date().toISOString(),
    url: '#',
    snippet: '知名香料供應商Z公司產品遭回收，需清查客戶是否使用該批號原料。',
    category: Category.DEFENSIVE,
    analyzed: false
  }
];