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
        elims: parseInt(row.Kill) || 0, // Green Bar (Left Y-Axis)
        damage: parseInt(row.Damage) || 0, // Black Bar (Right Y-Axis)
      };
    });

  // Sort by Elims (descending) 
  chartData.sort((a: any, b: any) => b.elims - a.elims);

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
        {/* Hiding the text to match the image which only shows logos inside the boxes */}
      </g>
    );
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value, fill } = props;
    if (value === 0) return null;
    return (
      <text
        x={x + width / 2}
        y={y + 20} // Adjusted to sit nicely inside/top of bar
        fill={fill === '#000000' ? '#ffffff' : '#000000'} // Contrast color for readability
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
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{fill: '#00ffa3', fontWeight: 'bold'}}
              domain={[0, (dataMax: number) => Math.max(dataMax * 1.5, 30)]}
            />

            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{fill: '#000', fontWeight: 'bold'}}
              domain={[0, (dataMax: number) => dataMax * 1.1]}
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
            <ReferenceLine y={0} yAxisId="left" stroke="#ff0000" strokeWidth={6} />

            {/* Green Bar (Kills) */}
            <Bar 
              yAxisId="left"
              dataKey="elims" 
              name="Kills"
              fill="#00ffa3" 
              label={<CustomBarLabel fill="#00ffa3" />}
            />
            
            {/* Black Bar (Damage) */}
            <Bar 
              yAxisId="right"
              dataKey="damage" 
              name="Damage"
              fill="#000000" 
              label={<CustomBarLabel fill="#000000" />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
