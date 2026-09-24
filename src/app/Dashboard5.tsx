'use client';

import useSWR from 'swr';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard5() {
  const { data, error, isLoading } = useSWR('/api/sheet5', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-orange-400">Loading Live Stats...</div>;
  if (error || !data?.data || data.data.length < 2) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  const team1Row = data.data[0];
  const team2Row = data.data[1];

  const team1 = {
    kills: parseInt(team1Row[2]) || 0,
    assists: parseInt(team1Row[3]) || 0,
    knockDown: parseInt(team1Row[4]) || 0,
    headshots: parseInt(team1Row[30]) || 0,
    color: '#a855f7', // Purple
    textColor: '#ffffff'
  };

  const team2 = {
    kills: parseInt(team2Row[2]) || 0,
    assists: parseInt(team2Row[3]) || 0,
    knockDown: parseInt(team2Row[4]) || 0,
    headshots: parseInt(team2Row[30]) || 0,
    color: '#eab308', // Yellow
    textColor: '#000000'
  };

  // Normalize data for the slope chart visual (values mapped to [20, 80] range)
  const getNormalized = (val1: number, val2: number) => {
    if (val1 === val2) return { t1: 50, t2: 50 };
    const max = Math.max(val1, val2);
    if (max === 0) return { t1: 20, t2: 20 };
    return { 
      t1: 20 + (val1 / max) * 60, 
      t2: 20 + (val2 / max) * 60 
    };
  };

  const killsNorm = getNormalized(team1.kills, team2.kills);
  const headshotsNorm = getNormalized(team1.headshots, team2.headshots);
  const assistsNorm = getNormalized(team1.assists, team2.assists);
  const knockNorm = getNormalized(team1.knockDown, team2.knockDown);

  const chartData = [
    { name: 'KILLS', team1: killsNorm.t1, team2: killsNorm.t2 },
    { name: 'HEADSHOTS', team1: headshotsNorm.t1, team2: headshotsNorm.t2 },
    { name: 'ASSISTS', team1: assistsNorm.t1, team2: assistsNorm.t2 },
    { name: 'KNOCKDOWN', team1: knockNorm.t1, team2: knockNorm.t2 },
  ];

  // Custom Dot component that draws the circle and the text badge
  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey, color, textColor, isTop } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    const label = payload.name;
    const badgeWidth = 100;
    const badgeHeight = 28;
    
    // Position badge so it sits right on top or right below the dot
    const badgeY = isTop ? cy - badgeHeight - 6 : cy + 6;
    const badgeX = cx - badgeWidth / 2;

    return (
      <g>
        {/* Core Dot */}
        <circle cx={cx} cy={cy} r={6} fill={color} stroke="#111" strokeWidth={1} />
        
        {/* Rectangular Badge */}
        <rect 
          x={badgeX} 
          y={badgeY} 
          width={badgeWidth} 
          height={badgeHeight} 
          fill={color} 
          rx={2}
        />
        
        {/* Text inside badge */}
        <text
          x={cx}
          y={badgeY + 19}
          textAnchor="middle"
          fill={textColor}
          fontSize={14}
          fontWeight="900"
          className="uppercase tracking-widest"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full min-h-screen p-8 flex items-center justify-center bg-transparent overflow-hidden">
      <div className="w-full max-w-4xl h-[700px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 80, right: 80, bottom: 80, left: 80 }}>
            {/* Thin vertical lines only */}
            <CartesianGrid stroke="#ffffff40" vertical={true} horizontal={false} />
            
            {/* Hidden Axes */}
            <XAxis dataKey="name" hide={true} />
            <YAxis domain={[0, 100]} hide={true} />
            
            {/* Team 1 Line (Purple) */}
            <Line 
              type="linear" 
              dataKey="team1" 
              stroke="#6b7280" 
              strokeWidth={3} 
              dot={(props) => (
                <CustomDot 
                  {...props} 
                  color={team1.color} 
                  textColor={team1.textColor}
                  isTop={props.payload.team1 >= props.payload.team2}
                />
              )} 
            />
            
            {/* Team 2 Line (Yellow) */}
            <Line 
              type="linear" 
              dataKey="team2" 
              stroke="#6b7280" 
              strokeWidth={3} 
              dot={(props) => (
                <CustomDot 
                  {...props} 
                  color={team2.color} 
                  textColor={team2.textColor}
                  isTop={props.payload.team2 > props.payload.team1}
                />
              )} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
