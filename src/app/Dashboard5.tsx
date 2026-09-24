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
    damage: parseInt(team1Row[7]) || 0,
    headshots: parseInt(team1Row[30]) || 0,
    color: '#a855f7', // Purple
    textColor: '#ffffff'
  };

  const team2 = {
    kills: parseInt(team2Row[2]) || 0,
    assists: parseInt(team2Row[3]) || 0,
    knockDown: parseInt(team2Row[4]) || 0,
    damage: parseInt(team2Row[7]) || 0,
    headshots: parseInt(team2Row[30]) || 0,
    color: '#eab308', // Yellow
    textColor: '#000000'
  };

  // Map values to a specific vertical band to enforce the 'V' shape
  // Kills: mapped to [40, 80]
  // Headshots: mapped to [10, 50] (creates the dip)
  // Assists: mapped to [35, 75] (goes back up)
  // Damage: mapped to [60, 90] (highest)
  
  const scaleValue = (val: number, max: number, minBound: number, maxBound: number) => {
    if (max === 0) return minBound;
    return minBound + (val / max) * (maxBound - minBound);
  };

  const maxKills = Math.max(team1.kills, team2.kills) || 1;
  const maxHeadshots = Math.max(team1.headshots, team2.headshots) || 1;
  const maxAssists = Math.max(team1.assists, team2.assists) || 1;
  const maxDamage = Math.max(team1.damage, team2.damage) || 1;

  const chartData = [
    { 
      name: 'KILLS', 
      team1: scaleValue(team1.kills, maxKills, 40, 80), 
      team2: scaleValue(team2.kills, maxKills, 40, 80), 
      team1Value: team1.kills, 
      team2Value: team2.kills 
    },
    { 
      name: 'HEADSHOTS', 
      team1: scaleValue(team1.headshots, maxHeadshots, 10, 50), 
      team2: scaleValue(team2.headshots, maxHeadshots, 10, 50), 
      team1Value: team1.headshots, 
      team2Value: team2.headshots 
    },
    { 
      name: 'ASSISTS', 
      team1: scaleValue(team1.assists, maxAssists, 35, 75), 
      team2: scaleValue(team2.assists, maxAssists, 35, 75), 
      team1Value: team1.assists, 
      team2Value: team2.assists 
    },
    { 
      name: 'DAMAGE', 
      team1: scaleValue(team1.damage, maxDamage, 60, 90), 
      team2: scaleValue(team2.damage, maxDamage, 60, 90), 
      team1Value: team1.damage, 
      team2Value: team2.damage 
    },
  ];

  // Custom Dot component that draws the circle and the text badge
  const CustomDot = (props: any) => {
    const { cx, cy, payload, color, textColor, isTop } = props;
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    const label = payload.name;
    const badgeWidth = 84; // Increased width for better horizontal padding
    const badgeHeight = 20; // Increased height for better vertical padding
    
    // Position badge so it sits right on top or right below the dot
    const badgeY = isTop ? cy - badgeHeight - 5 : cy + 5;
    const badgeX = cx - badgeWidth / 2;

    return (
      <g>
        {/* Core Dot */}
        <circle cx={cx} cy={cy} r={4} fill={color} stroke="#111" strokeWidth={1} />
        
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
          y={badgeY + 14}
          textAnchor="middle"
          fill={textColor}
          fontSize={10}
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
