'use client';

import useSWR from 'swr';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
        damage: parseInt(row.Damage) || 0,
        total: parseInt(row.Total) || 0,
      };
    });

  const CustomScatterNode = (props: any) => {
    const { cx, cy, payload } = props;
    
    // Safety check in case the coordinates are not numbers
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    return (
      <g transform={`translate(${cx},${cy})`}>
        {/* Neon Glow Circle */}
        <circle 
          cx={0} 
          cy={0} 
          r={28} 
          fill="#1a1a2e" 
          stroke="#ff00a0" 
          strokeWidth={3} 
          style={{ filter: 'drop-shadow(0 0 10px #ff00a0)' }} 
        />
        {/* Team Logo */}
        <image 
          href={payload.logo} 
          x={-20} 
          y={-20} 
          height="40" 
          width="40" 
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
        {/* Team Name Label */}
        <text 
          x={0} 
          y={45} 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize={11} 
          fontWeight="bold" 
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.8))' }}
        >
          {payload.name}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f0c29]/90 backdrop-blur-md p-5 border-2 border-[#ff00a0] rounded-2xl shadow-[0_0_20px_rgba(255,0,160,0.6)]">
          <div className="flex items-center space-x-4 mb-4 border-b border-[#ffffff20] pb-3">
            <img src={data.logo} alt="logo" className="w-12 h-12 rounded-full border border-[#ffffff50]" />
            <span className="text-white font-black text-xl tracking-wider">{data.name}</span>
          </div>
          <div className="space-y-2">
            <p className="text-[#00ffa3] font-bold text-lg flex justify-between">
              <span>Total Kills:</span> <span className="ml-4">{data.kills}</span>
            </p>
            <p className="text-[#ffea00] font-bold text-lg flex justify-between">
              <span>Total Damage:</span> <span className="ml-4">{data.damage}</span>
            </p>
            <p className="text-white font-bold text-lg flex justify-between border-t border-[#ffffff20] pt-2 mt-2">
              <span>Total Score:</span> <span className="ml-4">{data.total}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-hidden">
      <div className="text-center mb-10 z-10">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff00a0] via-[#00ffa3] to-[#ffea00] drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] tracking-widest uppercase">
          Efficiency Matrix
        </h1>
        <p className="text-gray-300 mt-3 text-lg font-medium tracking-wide">Kill & Damage Analysis Grid</p>
      </div>
      
      <div className="w-full max-w-7xl h-[700px] z-10 relative bg-[#00000040] rounded-3xl border border-[#ffffff10] p-6 shadow-2xl backdrop-blur-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
            <CartesianGrid stroke="#ffffff15" strokeDasharray="3 3" />
            
            <XAxis 
              type="number" 
              dataKey="kills" 
              name="Kills" 
              stroke="#00ffa3" 
              tick={{fill: '#00ffa3', fontSize: 14, fontWeight: 'bold'}} 
              label={{ value: 'TOTAL KILLS ➔', position: 'bottom', fill: '#00ffa3', fontWeight: '900', fontSize: 16, offset: 20 }} 
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            
            <YAxis 
              type="number" 
              dataKey="damage" 
              name="Damage" 
              stroke="#ffea00" 
              tick={{fill: '#ffea00', fontSize: 14, fontWeight: 'bold'}} 
              label={{ value: 'TOTAL DAMAGE ➔', angle: -90, position: 'left', fill: '#ffea00', fontWeight: '900', fontSize: 16, offset: 20 }} 
              domain={[0, (dataMax: number) => dataMax * 1.1]}
            />
            
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: '#ffffff50', strokeWidth: 2 }} 
              content={<CustomTooltip />} 
            />
            
            <Scatter 
              name="Teams" 
              data={chartData} 
              shape={<CustomScatterNode />} 
              isAnimationActive={true}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
