'use client';

import useSWR from 'swr';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard2() {
  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-green-500">Loading Live Stats...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  // Process data for the chart directly from the API response
  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), 
        logo: row.LogoUrl, 
        total: parseInt(row.Total) || 0, // Green Bar
        elims: parseInt(row.Kill) || 0, // Black Bar
      };
    });

  // Sort by Total points (descending) 
  chartData.sort((a: any, b: any) => b.total - a.total);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const teamData = chartData.find((d: any) => d.name === payload.value) || {};

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Cyan Box Background */}
        <rect x={-25} y={5} width="50" height="50" fill="#00ffa3" />
        {/* Inner black border/box */}
        <rect x={-23} y={7} width="46" height="46" fill="#000" />
        <image
          href={teamData.logo}
          x={-20}
          y={10}
          height="40"
          width="40"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />
        {/* We can hide the text to match the image which only shows logos inside the boxes */}
      </g>
    );
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value, fill } = props;
    if (value === 0) return null;
    return (
      <text
        x={x + width / 2}
        y={y + 15}
        fill={fill === '#000000' ? '#ffffff' : '#000000'} // Contrast color
        textAnchor="middle"
        fontSize={14}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <div 
      className="w-full min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden bg-white" 
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #f0f0f0 0%, #ffffff 100%)'
      }}
    >
      <div className="w-full max-w-6xl h-[600px] z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 60, right: 20, bottom: 80, left: 20 }}
            barGap={0} // No gap between the green and black bars
          >
            <CartesianGrid stroke="#e0e0e0" vertical={false} />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{fill: '#666', fontSize: 14}}
            />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomXAxisTick />} 
              interval={0} 
              axisLine={{ stroke: '#000', strokeWidth: 2 }}
              tickLine={false}
            />
            
            <Tooltip 
              cursor={{fill: '#f5f5f5'}}
              contentStyle={{ backgroundColor: '#111', borderColor: '#00ffa3', color: '#fff', borderRadius: '4px' }}
            />

            {/* Red Reference Line at the bottom similar to the image */}
            <ReferenceLine y={0} stroke="#ff0000" strokeWidth={6} />

            {/* Green Bar (e.g. Total Score) */}
            <Bar 
              dataKey="total" 
              name="Total Score"
              fill="#00ffa3" 
              label={<CustomBarLabel fill="#00ffa3" />}
            />
            
            {/* Black Bar (e.g. Kills) */}
            <Bar 
              dataKey="elims" 
              name="Kills"
              fill="#000000" 
              label={<CustomBarLabel fill="#000000" />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
