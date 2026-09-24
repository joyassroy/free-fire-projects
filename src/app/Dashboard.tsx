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
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
    // payload.payload contains the full data object for this tick
    const teamData = payload.payload;

    return (
      <g transform={`translate(${x},${y})`}>
        <image
          href={teamData.logo} // Dynamically loaded from Google Drive or Fallback
          x={-20}
          y={10}
          height="40"
          width="40"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
        />
        <text
          x={0}
          y={65}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={11}
          fontWeight="bold"
        >
          {teamData.name}
        </text>
      </g>
    );
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null; // Don't show 0
    return (
      <text
        x={x + width / 2}
        y={y + 20}
        fill="#000"
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
        fill="#ffc600"
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
      className="w-full min-h-screen p-8 flex flex-col items-center justify-center relative overflow-hidden" 
      style={{ 
        background: 'linear-gradient(135deg, #18092a 0%, #2a114f 50%, #18092a 100%)' 
      }}
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
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => Math.max(dataMax * 2, 30)]}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: 'DAMAGE', angle: 90, position: 'insideRight', fill: '#ffc600', fontWeight: 'bold', offset: -10 }} 
              tick={{fill: '#ffc600', fontSize: 14}}
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
              fill="#ffffff" 
              radius={[4, 4, 0, 0]}
              label={<CustomBarLabel />}
            />
            
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="damage" 
              stroke="#ffc600" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#ffc600', stroke: '#000', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#fff', stroke: '#ffc600' }}
              label={<CustomLineLabel />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
