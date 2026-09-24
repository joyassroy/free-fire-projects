'use client';

import useSWR from 'swr';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard3() {
  const { data, error, isLoading } = useSWR('/api/sheet', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-[#ff00a0]">Loading Live Stats...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  const chartData = (data?.data || [])
    .filter((row: any) => row.TeamName && row.TeamName.trim() !== '')
    .map((row: any) => {
      return {
        name: row.TeamName.trim(), 
        logo: row.LogoUrl, 
        damage: parseInt(row.Damage) || 0,
      };
    });

  // Sort by Damage (ascending: low to high)
  chartData.sort((a: any, b: any) => a.damage - b.damage);

  const CustomLogoDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    return (
      <g transform={`translate(${cx},${cy})`}>
        {/* Neon Glow Circle */}
        <circle 
          cx={0} 
          cy={0} 
          r={26} 
          fill="#1a1a2e" 
          stroke="#ff00a0" 
          strokeWidth={3} 
          style={{ filter: 'drop-shadow(0 0 10px #ff00a0)' }} 
        />
        {/* Team Logo */}
        <image 
          href={payload.logo} 
          x={-18} 
          y={-18} 
          height="36" 
          width="36" 
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
        {/* Value Label above the Logo */}
        <text 
          x={0} 
          y={-35} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize={16} 
          fontWeight="bold" 
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
        >
          {payload.damage}
        </text>
      </g>
    );
  };

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    // Break long names into two lines
    const words = payload.value ? payload.value.split(' ') : [];
    const line1 = words[0] || '';
    const line2 = words.slice(1).join(' ') || '';

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={15} textAnchor="middle" fill="#ffffff" fontSize={11} fontWeight="bold">
          <tspan x="0" dy="0">{line1}</tspan>
          {line2 && <tspan x="0" dy="14">{line2}</tspan>}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      <div className="text-center mb-16 z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff00a0] via-[#00ffa3] to-[#ffea00] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] tracking-widest uppercase">
          Damage Leaderboard
        </h1>
        <p className="text-[#00ffa3] mt-3 text-xl font-medium tracking-wide">Top Damage Dealers</p>
      </div>
      
      <div className="w-full max-w-7xl h-[600px] z-10 relative bg-[#00000040] rounded-3xl border border-[#ffffff10] p-6 shadow-2xl backdrop-blur-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 60, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid stroke="#ffffff15" strokeDasharray="3 3" vertical={false} />
            
            <XAxis 
              dataKey="name" 
              tick={<CustomXAxisTick />} 
              interval={0} 
              axisLine={{ stroke: '#ff00a0', strokeWidth: 2 }}
              tickLine={false}
            />
            
            <YAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{fill: '#ff00a0', fontSize: 14, fontWeight: 'bold'}} 
              domain={[0, (dataMax: number) => dataMax * 1.2]}
            />
            
            <Tooltip 
              cursor={{fill: '#ffffff10'}}
              contentStyle={{ backgroundColor: '#111', borderColor: '#ff00a0', color: '#fff', borderRadius: '8px' }}
            />
            
            {/* The Neon Laser Beam (Thin Bar) */}
            <Bar dataKey="damage" barSize={4} radius={[10, 10, 0, 0]}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill="#ff00a0" style={{ filter: 'drop-shadow(0 0 8px #ff00a0)' }} />
              ))}
            </Bar>

            {/* The Floating Logo at the top of the beam */}
            <Line 
              type="monotone" 
              dataKey="damage" 
              stroke="none" 
              isAnimationActive={false} // Prevents dot drifting
              activeDot={false} 
              dot={<CustomLogoDot />} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
