import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { NewsItem } from '../types';

interface StatsWidgetProps {
  items: NewsItem[];
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ items }) => {
  const analyzed = items.filter(i => i.analyzed && i.analysis);
  const positive = analyzed.filter(i => i.analysis?.sentiment === 'POSITIVE').length;
  const negative = analyzed.filter(i => i.analysis?.sentiment === 'NEGATIVE').length;
  const neutral = analyzed.filter(i => i.analysis?.sentiment === 'NEUTRAL').length;

  const data = [
    { name: '正面', value: positive, color: '#22c55e' }, // green-500
    { name: '中立', value: neutral, color: '#94a3b8' },  // slate-400
    { name: '負面', value: negative, color: '#ef4444' }, // red-500
  ];

  if (analyzed.length === 0) {
     return (
         <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 p-6">
            <p>尚無分析資料</p>
            <p className="text-sm">請點擊分析按鈕以查看情緒分佈</p>
         </div>
     )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">情緒分析總覽</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-2">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
            <span className="text-sm text-slate-600 font-medium">{d.name}</span>
            <span className="text-sm text-slate-400">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsWidget;