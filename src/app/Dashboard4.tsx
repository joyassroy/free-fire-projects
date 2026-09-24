'use client';

import useSWR from 'swr';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard4() {
  const { data, error, isLoading } = useSWR('/api/sheet4', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-2xl font-bold text-orange-400">Loading Live Stats...</div>;
  if (error || !data?.data || data.data.length < 2) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  const team1Row = data.data[0];
  const team2Row = data.data[1];

  // Extract Team Names from index 0 (e.g. "C:\Team Logo\X2.png" -> "X2")
  const extractTeamName = (path: string) => {
    if (!path) return 'TEAM';
    const parts = path.split('\\');
    const filename = parts[parts.length - 1];
    return filename ? filename.replace('.png', '').toUpperCase() : 'TEAM';
  };

  const team1 = {
    name: extractTeamName(team1Row[0]),
    kills: parseInt(team1Row[2]) || 0,
    assist: parseInt(team1Row[3]) || 0,
    knockDown: parseInt(team1Row[4]) || 0,
    damage: parseInt(team1Row[7]) || 0,
    color: '#f59e0b', // Orange/Yellow
  };

  const team2 = {
    name: extractTeamName(team2Row[0]),
    kills: parseInt(team2Row[2]) || 0,
    assist: parseInt(team2Row[3]) || 0,
    knockDown: parseInt(team2Row[4]) || 0,
    damage: parseInt(team2Row[7]) || 0,
    color: '#3b82f6', // Blue
  };

  // Normalize data for Radar Chart (0 to 100)
  const getNormalized = (val1: number, val2: number) => {
    const max = Math.max(val1, val2) * 1.1; // 10% headroom
    if (max === 0) return { n1: 0, n2: 0 };
    return { n1: (val1 / max) * 100, n2: (val2 / max) * 100 };
  };

  const killsNorm = getNormalized(team1.kills, team2.kills);
  const damageNorm = getNormalized(team1.damage, team2.damage);
  const assistNorm = getNormalized(team1.assist, team2.assist);
  const knockNorm = getNormalized(team1.knockDown, team2.knockDown);

  const radarData = [
    { subject: 'KILL PTS', A: killsNorm.n1, B: killsNorm.n2 },
    { subject: 'DAMAGE', A: damageNorm.n1, B: damageNorm.n2 },
    { subject: 'ASSIST', A: assistNorm.n1, B: assistNorm.n2 },
    { subject: 'KNOCK DOWN', A: knockNorm.n1, B: knockNorm.n2 },
  ];

  return (
    <div className="w-full min-h-screen p-8 flex items-center justify-center bg-transparent overflow-hidden">
      
      {/* Container for the 3 columns (Left Stats, Radar, Right Stats) */}
      <div className="w-full max-w-7xl flex items-center justify-between z-10 relative px-12">
        
        {/* Left Team Stats */}
        <div className="flex flex-col items-end w-64 text-right">
          <div 
            className="px-6 py-2 font-black text-xl italic tracking-wider shadow-lg transform -skew-x-12 mb-6 text-black"
            style={{ backgroundColor: team1.color }}
          >
            <span className="block transform skew-x-12">{team1.name}</span>
          </div>
          
          <div className="space-y-4 text-xl font-bold" style={{ color: team1.color }}>
            <p>{team1.kills}</p>
            <p>{team1.damage}</p>
            <p>{team1.assist}</p>
            <p>{team1.knockDown}</p>
          </div>
        </div>

        {/* Center Radar Chart */}
        <div className="w-[600px] h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
              {/* PolarGrid styles the spider web lines */}
              <PolarGrid stroke="#ffffff30" />
              
              {/* The labels (KILL PTS, DAMAGE, etc.) */}
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#ffffff80', fontSize: 16, fontWeight: 'bold' }} 
              />
              
              {/* Radar for Team 1 */}
              <Radar
                name={team1.name}
                dataKey="A"
                stroke={team1.color}
                fill={team1.color}
                fillOpacity={0.6}
                strokeWidth={3}
              />
              
              {/* Radar for Team 2 */}
              <Radar
                name={team2.name}
                dataKey="B"
                stroke={team2.color}
                fill={team2.color}
                fillOpacity={0.6}
                strokeWidth={3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Right Team Stats */}
        <div className="flex flex-col items-start w-64 text-left">
          <div 
            className="px-6 py-2 font-black text-xl italic tracking-wider shadow-lg transform -skew-x-12 mb-6 text-black"
            style={{ backgroundColor: team2.color }}
          >
            <span className="block transform skew-x-12">{team2.name}</span>
          </div>
          
          <div className="space-y-4 text-xl font-bold" style={{ color: team2.color }}>
            <p>{team2.kills}</p>
            <p>{team2.damage}</p>
            <p>{team2.assist}</p>
            <p>{team2.knockDown}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
