'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProjectionPanelProps {
  currentScore: number;
  projectedScore: number;
}

const ProjectionPanel: React.FC<ProjectionPanelProps> = ({ currentScore, projectedScore }) => {
  const data = [
    { name: 'Current', score: currentScore },
    { name: 'Projected', score: projectedScore },
  ];

  const improvement = projectedScore - currentScore;

  return (
     <div className="dark-gradient p-5 rounded-2xl border border-primary-200/25 shadow-sm flex flex-col justify-between h-full">
       <div className="flex items-start justify-between mb-3">
         <div>
           <h3 className="text-lg font-bold text-primary-200">Score Projection</h3>
           <p className="text-sm text-light-100">Potential Improvement</p>
         </div>
         <div className="flex items-center gap-1 text-primary-200 font-bold bg-primary-200/10 px-3 py-1 rounded-full text-sm border border-primary-200/30">
           <TrendingUp size={16} />
           +{improvement} pts
         </div>
       </div>

       <div className="h-40 w-full">
         <ResponsiveContainer width="100%" height="100%">
           <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#d6e0ff' }} />
             <YAxis hide domain={[0, 100]} />
             <Tooltip
               cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid rgba(202,197,254,0.2)', background: '#111327', color: '#d6e0ff' }}
             />
             <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
               {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#6870a6' : '#cac5fe'} />
               ))}
             </Bar>
           </BarChart>
         </ResponsiveContainer>
       </div>

        <p className="mt-2 text-xs text-light-100 leading-relaxed">
          The projected score estimates your ATS lift after applying keyword, impact, and formatting recommendations.
        </p>
    </div>
  );
};

export default ProjectionPanel;
