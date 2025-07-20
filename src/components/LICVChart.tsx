"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

const chartData = [
  { keyword: "", linkedin: 0, cv: 0 },
  { keyword: "JavaScript", linkedin: 85, cv: 90 },
  { keyword: "React", linkedin: 89, cv: 89 },
  { keyword: "Node.js", linkedin: 78, cv: 82 },
  { keyword: "Python", linkedin: 65, cv: 70 },
  { keyword: "SQL", linkedin: 88, cv: 85 },
  { keyword: "AWS", linkedin: 72, cv: 68 },
  { keyword: "Docker", linkedin: 60, cv: 55 },
  { keyword: "", linkedin: 0, cv: 0 },
]

const chartConfig = {
  expertise: {
    label: "Expertise Level",
  },
  linkedin: {
    label: "LinkedIn",
    color: "var(--chart-1)",
  },
  cv: {
    label: "CV",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function LICVChart() {
  // No filtering needed for keyword-based data
  const filteredData = chartData

  return (
    <div className="w-full h-full p-4">
      <Card className="w-full h-full bg-[#1A1D21] border-gray-800">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b border-gray-800 py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-gray-300">Expertise Comparison</CardTitle>
            <CardDescription className="text-gray-400">
              LinkedIn vs CV expertise levels by keyword
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillLinkedIn" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-linkedin)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-linkedin)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillCV" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-cv)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-cv)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#374151" />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => {
                  if (value === 0) return '';
                  if (value <= 25) return '1-3';
                  if (value <= 50) return '4-6';
                  if (value <= 75) return '7-10';
                  return '11-13+';
                }}
              />
              <XAxis
                dataKey="keyword"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tick={{ fill: '#9CA3AF', textAnchor: 'middle' }}
                tickFormatter={(value) => value || ''}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="cv"
                type="natural"
                fill="url(#fillCV)"
                stroke="#454446"
                stackId="a"
              />
              <Area
                dataKey="linkedin"
                type="natural"
                fill="url(#fillLinkedIn)"
                stroke="#454446"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
} 