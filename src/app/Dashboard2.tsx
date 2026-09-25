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

const COLORS = {
  primaryBar: '#003cff', // Green Bar (Kills)
  secondaryBar: '#000000', // Black Bar (Damage)
  primaryText: '#00ffa3',
  secondaryText: '#000000',
  axisLine: '#000000',
};

export default function Dashboard2() {
  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold" style={{ color: COLORS.primaryText }}>Loading Live Stats...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  // Process data for the chart directly from the API response
  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), 
        logo: row.LogoUrl, 
        elims: parseInt(row.Kill) || 0, // Primary Bar
        damage: parseInt(row.Damage) || 0, // Secondary Bar
      };
    });

  // Sort by Elims (descending) 
  chartData.sort((a: any, b: any) => b.elims - a.elims);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const teamData = chartData.find((d: any) => d.name === payload.value) || {};

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Cyan Box Background */}
        <rect x={-25} y={5} width="50" height="50" fill={COLORS.primaryBar} />
        {/* Inner black border/box */}
        <rect x={-23} y={7} width="46" height="46" fill={COLORS.secondaryBar} />
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
      </g>
    );
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value, textColor } = props;
    const bottomY = y + height - 5; 
    
    return (
      <text
        x={x + width / 2}
        y={bottomY} 
        fill={textColor} 
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#111', padding: '12px', border: `1px solid ${COLORS.primaryBar}`, borderRadius: '8px' }}>
          <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.dataKey === 'damage' ? '#ffffff' : COLORS.primaryText, margin: '4px 0', fontSize: '14px' }}>
              {entry.name} : {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="w-full min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden bg-transparent" 
    >
      <div className="w-full max-w-6xl h-[600px] z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 60, right: 20, bottom: 80, left: 20 }}
            barGap={0}
          >
            <CartesianGrid stroke="#e0e0e0" vertical={false} />
            
            <YAxis 
              yAxisId="left"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{fill: COLORS.primaryText, fontWeight: 'bold'}}
              tickFormatter={(value) => String(Math.round(value))}
              domain={[0, (dataMax: number) => Math.max(dataMax * 1.5, 30)]}
            />

            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{fill: COLORS.secondaryText, fontWeight: 'bold'}}
              tickFormatter={(value) => String(Math.round(value))}
              domain={[0, (dataMax: number) => dataMax * 1.1]}
            />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomXAxisTick />} 
              interval={0} 
              axisLine={{ stroke: COLORS.axisLine, strokeWidth: 2 }}
              tickLine={false}
            />
            
            <Tooltip 
              cursor={{fill: '#f5f5f5'}}
              content={<CustomTooltip />}
            />

            {/* Primary Bar (Kills) */}
            <Bar 
              yAxisId="left"
              dataKey="elims" 
              name="Kills"
              fill={COLORS.primaryBar} 
              label={<CustomBarLabel textColor={COLORS.secondaryText} />}
            />
            
            {/* Secondary Bar (Damage) */}
            <Bar 
              yAxisId="right"
              dataKey="damage" 
              name="Damage"
              fill={COLORS.secondaryBar} 
              label={<CustomBarLabel textColor={COLORS.primaryText} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
