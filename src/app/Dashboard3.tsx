'use client';

import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard3() {
  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-[#00ffa3]">Loading Live Stats...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), 
        logo: row.LogoUrl, 
        kills: parseInt(row.Kill) || 0, 
        survival: parseInt(row['Survival Score']) || 0,
        damage: parseInt(row.Damage) || 0,
        total: parseInt(row.Total) || 0,
      };
    });

  // Sort by Total Score to give a logical flow to the lines, or keep original order
  // Let's sort by Total (descending) so the best teams are on the left
  chartData.sort((a: any, b: any) => b.total - a.total);

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const teamData = chartData.find((d: any) => d.name === payload.value) || {};
    
    return (
      <g transform={`translate(${x},${y})`}>
        {/* Only Logo, No Text */}
        <image 
          href={teamData.logo} 
          x={-20} 
          y={10} 
          height="40" 
          width="40" 
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111111ee] backdrop-blur-md p-4 border border-[#444] rounded-xl shadow-2xl">
          <div className="flex items-center space-x-3 mb-3 border-b border-[#333] pb-2">
            <img src={data.logo} alt="logo" className="w-8 h-8 rounded-full" />
            <span className="text-white font-bold text-lg">{data.name}</span>
          </div>
          <p className="text-[#00ffa3] font-semibold flex justify-between">
            <span>Kill Points:</span> <span className="ml-4">{data.kills}</span>
          </p>
          <p className="text-[#ffea00] font-semibold flex justify-between">
            <span>Survival Score:</span> <span className="ml-4">{data.survival}</span>
          </p>
          <p className="text-[#ff00a0] font-semibold flex justify-between border-t border-[#333] mt-2 pt-2">
            <span>Damage:</span> <span className="ml-4">{data.damage}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value: string, entry: any) => {
    const { color } = entry;
    return <span style={{ color, fontWeight: 'bold', marginRight: '20px', fontSize: '16px' }}>{value}</span>;
  };

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-transparent overflow-hidden">
      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl font-black text-white tracking-wider uppercase mb-2">
          Performance Overview
        </h1>
        <p className="text-gray-400 text-lg font-medium tracking-wide">Kill Points vs Survival Score vs Damage</p>
      </div>
      
      <div className="w-full max-w-7xl h-[600px] z-10 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid stroke="#ffffff15" vertical={false} />
            
            {/* Left Axis for Kills and Survival */}
            <YAxis 
              yAxisId="left" 
              axisLine={false}
              tickLine={false}
              tick={{fill: '#ffffff80', fontSize: 14, fontWeight: 'bold'}} 
              label={{ value: 'POINTS', angle: -90, position: 'insideLeft', fill: '#ffffff80', fontWeight: 'bold', offset: -10 }}
            />
            
            {/* Right Axis for Damage */}
            <YAxis 
              yAxisId="right" 
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{fill: '#ff00a0', fontSize: 14, fontWeight: 'bold'}} 
              label={{ value: 'DAMAGE', angle: 90, position: 'insideRight', fill: '#ff00a0', fontWeight: 'bold', offset: -10 }}
            />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomXAxisTick />} 
              interval={0} 
              axisLine={{ stroke: '#ffffff30', strokeWidth: 2 }}
              tickLine={false}
            />
            
            <Tooltip 
              cursor={{ stroke: '#ffffff30', strokeWidth: 2, strokeDasharray: '5 5' }} 
              content={<CustomTooltip />} 
            />
            
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              formatter={renderLegendText}
              wrapperStyle={{ paddingTop: '40px' }}
            />

            {/* Kill Points Line */}
            <Line 
              yAxisId="left"
              type="monotone" 
              name="Kill Points"
              dataKey="kills" 
              stroke="#00ffa3" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#00ffa3', stroke: '#111', strokeWidth: 2 }} 
              activeDot={{ r: 8, fill: '#fff', stroke: '#00ffa3', strokeWidth: 2 }} 
            />
            
            {/* Survival Score Line */}
            <Line 
              yAxisId="left"
              type="monotone" 
              name="Survival Score"
              dataKey="survival" 
              stroke="#ffea00" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#ffea00', stroke: '#111', strokeWidth: 2 }} 
              activeDot={{ r: 8, fill: '#fff', stroke: '#ffea00', strokeWidth: 2 }} 
            />
            
            {/* Damage Line (on Right Axis) */}
            <Line 
              yAxisId="right"
              type="monotone" 
              name="Damage"
              dataKey="damage" 
              stroke="#ff00a0" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#ff00a0', stroke: '#111', strokeWidth: 2 }} 
              activeDot={{ r: 8, fill: '#fff', stroke: '#ff00a0', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
