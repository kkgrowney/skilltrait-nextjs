import React from 'react';
import type { TooltipProps } from 'recharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const consistencyData = [
  { category: 'Work History', score: 95 },
  { category: 'Job Titles', score: 92 },
  { category: 'Dates of Employment', score: 100 },
  { category: 'Accomplishments', score: 85 },
  { category: 'Skills', score: 90 },
  { category: 'Education', score: 100 },
  { category: 'Tone & Branding', score: 88 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1B1D21] border border-[#454446] rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium">{label}</p>
        <p className="text-[#00DF71] font-bold">{`${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export default function ConsistencyAnalysisChart() {
  return (
    <div className="w-full h-full p-4">
      <Card className="w-full h-full bg-[#1A1D21]" style={{borderColor: '#454446'}}>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row" style={{borderColor: '#454446'}}>
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-gray-300">Resume vs. LinkedIn Profile Consistency Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Consistency scores across different categories
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={consistencyData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#454446" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#454446' }}
                tickLine={{ stroke: '#454446' }}
                label={{ value: 'Consistency Score (%)', position: 'insideBottom', offset: -10, style: { fill: '#9CA3AF' } }}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#454446' }}
                tickLine={{ stroke: '#454446' }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                fill="#00DF71"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right', fill: '#00DF71', fontSize: 12, fontWeight: 'bold' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 