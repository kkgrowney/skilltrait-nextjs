import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const skillData = [
  { skill: 'UX Design', cv: 13, linkedin: 13 },
  { skill: 'AI', cv: 5, linkedin: 2 },
  { skill: 'Product Roadmapping', cv: 12, linkedin: 9 },
  { skill: 'Usability Testing', cv: 12, linkedin: 11 },
  { skill: 'User Research', cv: 13, linkedin: 12 },
  { skill: 'Prototyping', cv: 12, linkedin: 11 },
  { skill: 'Data Analysis', cv: 9, linkedin: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1B1D21] border border-[#454446] rounded-lg p-3 shadow-lg">
        <p className="text-white font-medium">{label}</p>
        <p className="text-[#00DF71] font-bold">CV: {payload[0]?.value} years</p>
        <p className="text-[#0080FF] font-bold">LinkedIn: {payload[1]?.value} years</p>
      </div>
    );
  }
  return null;
};

export default function SkillComparisonChart() {
  return (
    <div className="w-full h-full p-4">
      <Card className="w-full h-full bg-[#1A1D21]" style={{borderColor: '#454446'}}>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row" style={{borderColor: '#454446'}}>
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-gray-300">Skill Comparison: CV vs LinkedIn</CardTitle>
            <CardDescription className="text-gray-400">
              Years of experience comparison across skills
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={skillData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0080FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0080FF" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#454446" />
              <XAxis
                dataKey="skill"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#454446' }}
                tickLine={{ stroke: '#454446' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: '#9CA3AF' }}
                axisLine={{ stroke: '#454446' }}
                tickLine={{ stroke: '#454446' }}
                label={{ value: 'Years of Experience', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                tickFormatter={(value) => {
                  if (value <= 3) return '1-3';
                  if (value <= 6) return '4-6';
                  if (value <= 10) return '7-10';
                  if (value <= 13) return '11-13';
                  return '13+';
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cv"
                stackId="1"
                stroke="#00DF71"
                strokeWidth={3}
                fill="transparent"
                dot={{ fill: '#00DF71', strokeWidth: 2, r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="linkedin"
                stackId="1"
                stroke="#0080FF"
                strokeWidth={3}
                fill="url(#fillArea)"
                dot={{ fill: '#0080FF', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#00DF71]"></div>
              <span className="text-gray-300 text-sm">CV</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#0080FF]"></div>
              <span className="text-gray-300 text-sm">LinkedIn</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 