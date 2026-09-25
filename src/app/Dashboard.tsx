'use client';

import useSWR from 'swr';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = {
  barFill: '#ffffff',
  lineStroke: '#ffc600',
  lineLabel: '#000000',
  barLabel: '#000000'
};

export default function Dashboard() {
  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-purple-400">Loading Live Stats...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  // Process data for the chart directly from the API response
  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), // The original team name from sheet
        logo: row.LogoUrl, // The dynamic Logo URL matched from Google Drive or fallback
        elims: parseInt(row.Kill) || 0,
        damage: parseInt(row.Damage) || 0,
      };
    });

  // Sort by Elims (descending) so highest is on the left
  chartData.sort((a: any, b: any) => b.elims - a.elims);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    // Find the team data safely from our chartData array using the tick value (name)
    const teamData = chartData.find((d: any) => d.name === payload.value) || {};

    const words = teamData.name ? teamData.name.split(' ') : [];
    const line1 = words[0] || '';
    const line2 = words.slice(1).join(' ') || '';

    return (
      <g transform={`translate(${x},${y})`}>
        <image
          href={teamData.logo}
          x={-25} // Shifted left a bit more to center 50x50 logo
          y={0}
          height="50"
          width="50"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />
      </g>
    );
  };

  const CustomBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const value = payload.elims;
    if (value === 0) return null; // No box for 0 kills

    const finalHeight = Math.max(height, 30);
    const bottom = y + height;
    const finalY = bottom - finalHeight;

    return <Rectangle x={x} y={finalY} width={width} height={finalHeight} fill={COLORS.barFill} radius={[4, 4, 0, 0]} />;
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (value === 0) return null; // Don't show 0
    
    const finalHeight = Math.max(height, 30);
    const bottom = y + height;
    const finalY = bottom - finalHeight;

    return (
      <text
        x={x + width / 2}
        y={finalY + 20}
        fill={COLORS.barLabel}
        textAnchor="middle"
        fontSize={16}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  const CustomLineLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === 0) return null; // Don't show 0
    return (
      <text
        x={x}
        y={y - 15}
        fill={COLORS.lineLabel}
        textAnchor="middle"
        fontSize={12}
      >
        {value}
      </text>
    );
  };

  return (
    <div 
      className="w-full min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden bg-transparent" 
    >
      <div className="w-full max-w-6xl h-[600px] z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 60, right: 20, bottom: 80, left: 20 }}
          >
            <CartesianGrid stroke="#ffffff10" vertical={false} />
            
            <YAxis 
              yAxisId="left" 
              label={{ value: 'ELIMS', angle: -90, position: 'insideLeft', fill: '#ffffff', fontWeight: 'bold', offset: -10 }} 
              tick={{fill: '#ffffff80', fontSize: 14}}
              tickFormatter={(value) => String(Math.round(value))}
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => Math.max(dataMax * 2, 30)]}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: 'DAMAGE', angle: 90, position: 'insideRight', fill: COLORS.lineStroke, fontWeight: 'bold', offset: -10 }} 
              tick={{fill: COLORS.lineStroke, fontSize: 14}}
              tickFormatter={(value) => String(Math.round(value))}
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => dataMax * 1.1]}
            />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomXAxisTick />} 
              interval={0} 
              axisLine={{ stroke: '#ffffff30' }}
              tickLine={false}
            />
            
            <Tooltip 
              cursor={{fill: '#ffffff10'}}
              contentStyle={{ backgroundColor: '#111111ee', borderColor: '#444', color: '#fff', borderRadius: '8px' }}
            />

            <Bar 
              yAxisId="left" 
              dataKey="elims" 
              barSize={40} 
              shape={<CustomBar />}
              label={<CustomBarLabel />}
            />
            
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="damage" 
              stroke={COLORS.lineStroke} 
              strokeWidth={3} 
              dot={{ r: 5, fill: COLORS.lineStroke, stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#fff', stroke: COLORS.lineStroke }}
              label={<CustomLineLabel />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
