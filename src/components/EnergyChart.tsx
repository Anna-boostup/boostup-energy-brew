import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// Data pro jednotlivé složky
const individualData = [
  { time: 0, kofein: 0, guarana: 0, theanin: 5 },
  { time: 0.5, kofein: 30, guarana: 5, theanin: 10 },
  { time: 1, kofein: 70, guarana: 15, theanin: 15 },
  { time: 1.5, kofein: 100, guarana: 30, theanin: 18 },
  { time: 2, kofein: 85, guarana: 55, theanin: 20 },
  { time: 2.5, kofein: 65, guarana: 75, theanin: 20 },
  { time: 3, kofein: 45, guarana: 90, theanin: 20 },
  { time: 3.5, kofein: 30, guarana: 95, theanin: 18 },
  { time: 4, kofein: 20, guarana: 85, theanin: 16 },
  { time: 4.5, kofein: 12, guarana: 70, theanin: 14 },
  { time: 5, kofein: 8, guarana: 50, theanin: 12 },
  { time: 5.5, kofein: 5, guarana: 35, theanin: 10 },
  { time: 6, kofein: 3, guarana: 20, theanin: 8 },
  { time: 6.5, kofein: 2, guarana: 10, theanin: 6 },
  { time: 7, kofein: 0, guarana: 5, theanin: 5 },
];

// Data pro synergický efekt
const synergyData = [
  { time: 0, synergy: 0 },
  { time: 0.5, synergy: 15 },
  { time: 1, synergy: 40 },
  { time: 1.5, synergy: 65 },
  { time: 2, synergy: 85 },
  { time: 2.5, synergy: 95 },
  { time: 3, synergy: 100 },
  { time: 3.5, synergy: 100 },
  { time: 4, synergy: 95 },
  { time: 4.5, synergy: 85 },
  { time: 5, synergy: 70 },
  { time: 5.5, synergy: 55 },
  { time: 6, synergy: 35 },
  { time: 6.5, synergy: 20 },
  { time: 7, synergy: 10 },
];

const ingredientInfo = [
  {
    name: "Kofein",
    color: "#aa263e",
    description: "Rychlý nástup a ostrý vrchol. Účinek kofeinu rychle stoupá, vrcholí přibližně 1,5 hodiny po konzumaci a poté relativně rychle klesá."
  },
  {
    name: "Guarana",
    color: "#f29739",
    description: "Pomalý a déletrvající účinek. Guarana má pozvolnější nástup, její účinek vrcholí později (kolem 3-4 hodin) a poskytuje stabilnější stimulaci."
  },
  {
    name: "Theanin",
    color: "#dfdf57",
    description: "Stabilizační základna. Theanin podporuje klidnou koncentraci, zmírňuje nervozitu z kofeinu a poskytuje vyváženou mentální ostrost bez vedlejších účinků."
  },
];

const EnergyChart = () => {
  return (
    <div className="w-full bg-gradient-to-br from-cream via-background to-secondary/30 rounded-3xl p-6 md:p-10 shadow-card">
      {/* Header */}
      <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-foreground text-center mb-2">
        Synergie v Čase
      </h3>
      <p className="text-center text-muted-foreground mb-10 text-lg">
        Průběh účinku energetických látek
      </p>

      {/* Individual effects chart */}
      <div className="mb-10">
        <h4 className="text-lg font-bold text-foreground mb-4 text-center">
          Časový průběh účinku: Jednotlivě
        </h4>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={individualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="kofeinGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#aa263e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#aa263e" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="guaranaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f29739" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f29739" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="theaninGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dfdf57" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#dfdf57" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `${value}h`}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f4f1e6', 
                  border: '2px solid #3d5a2f',
                  borderRadius: '12px',
                  padding: '12px'
                }}
                formatter={(value: number, name: string) => [`${value}%`, name.charAt(0).toUpperCase() + name.slice(1)]}
                labelFormatter={(label) => `Čas: ${label} hod`}
              />
              <Area 
                type="monotone" 
                dataKey="theanin" 
                stroke="#dfdf57" 
                strokeWidth={3}
                fill="url(#theaninGradient)" 
                name="theanin"
              />
              <Area 
                type="monotone" 
                dataKey="guarana" 
                stroke="#f29739" 
                strokeWidth={3}
                fill="url(#guaranaGradient)" 
                name="guarana"
              />
              <Area 
                type="monotone" 
                dataKey="kofein" 
                stroke="#aa263e" 
                strokeWidth={3}
                fill="url(#kofeinGradient)" 
                name="kofein"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with descriptions */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {ingredientInfo.map((item) => (
            <div 
              key={item.name}
              className="p-4 rounded-2xl bg-background/80 border border-border"
              style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
            >
              <h5 className="font-bold text-foreground mb-1" style={{ color: item.color }}>
                {item.name}
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Synergy chart */}
      <div>
        <h4 className="text-lg font-bold text-foreground mb-4 text-center">
          Synergický Efekt: Celkový Účinek
        </h4>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={synergyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="synergyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3d5a2f" stopOpacity={0.9}/>
                  <stop offset="50%" stopColor="#6b8e5a" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3d5a2f" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
                label={{ value: 'Čas (hodiny)', position: 'bottom', offset: -5, fill: '#666' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f4f1e6', 
                  border: '2px solid #3d5a2f',
                  borderRadius: '12px',
                  padding: '12px'
                }}
                formatter={(value: number) => [`${value}%`, 'Celkový účinek']}
                labelFormatter={(label) => `Čas: ${label} hod`}
              />
              <Area 
                type="monotone" 
                dataKey="synergy" 
                stroke="#3d5a2f" 
                strokeWidth={4}
                fill="url(#synergyGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Synergy description */}
        <div className="mt-6 p-6 rounded-2xl bg-olive/10 border-2 border-olive/30">
          <h5 className="font-bold text-olive text-lg mb-2">
            Synergický efekt: Silnější, delší a bez propadu
          </h5>
          <p className="text-muted-foreground leading-relaxed">
            Kombinovaný účinek dosahuje vrcholu kolem 3,5 hodiny, je výrazně silnější než u jednotlivých složek a klesá velmi pozvolna, čímž se předchází náhlému útlumu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyChart;
