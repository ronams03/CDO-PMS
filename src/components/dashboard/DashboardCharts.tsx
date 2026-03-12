'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

interface RequestsChartProps {
  data: { status: string; count: number }[]
}

const statusColors: Record<string, string> = {
  PENDING: '#fbbf24',
  UNDER_REVIEW: '#3b82f6',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
  COMPLETED: '#10b981',
}

const chartConfig = {
  count: {
    label: 'Count',
  },
} satisfies ChartConfig

export function RequestsChart({ data }: RequestsChartProps) {
  const chartData = data.map(d => ({
    name: d.status.replace('_', ' '),
    count: d.count,
    fill: statusColors[d.status] || '#6b7280',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Requests by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface ComplaintsChartProps {
  data: { status: string; count: number }[]
}

const complaintStatusColors: Record<string, string> = {
  SUBMITTED: '#fbbf24',
  ACKNOWLEDGED: '#3b82f6',
  IN_PROGRESS: '#f97316',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
}

export function ComplaintsChart({ data }: ComplaintsChartProps) {
  const chartData = data.map(d => ({
    name: d.status.replace('_', ' '),
    value: d.count,
    fill: complaintStatusColors[d.status] || '#6b7280',
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaints by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface MonthlyTrendsChartProps {
  data: { month: string; count: number }[]
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const chartData = data.map(d => ({
    month: d.month,
    count: d.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Request Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface BarangayChartProps {
  data: { barangayName: string; count: number }[]
}

export function BarangayChart({ data }: BarangayChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Residents by Barangay (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="barangayName" type="category" width={100} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
