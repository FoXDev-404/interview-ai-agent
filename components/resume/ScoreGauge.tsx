'use client';

import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const getColor = (val: number) => {
    if (val >= 75) return '#cac5fe';
    if (val >= 50) return '#7c6fff';
    return '#f75353';
  };

  const getLabel = (val: number) => {
    if (val >= 75) return 'Strong match';
    if (val >= 50) return 'Improving match';
    return 'Low match';
  };

  const data = [{ name: 'Score', value: score, fill: getColor(score) }];

  return (
    <div className="relative w-full h-56 flex flex-col items-center justify-center rounded-2xl bg-dark-100/70 px-2 border border-primary-200/15">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1 mt-4 text-center">
        <span className="text-5xl font-bold text-white block">{score}</span>
        <span className="text-xs text-primary-200 uppercase tracking-[0.2em] font-semibold">Match Score</span>
        <div className="mt-2 text-xs font-semibold text-light-100">{getLabel(score)}</div>
      </div>
    </div>
  );
};

export default ScoreGauge;
