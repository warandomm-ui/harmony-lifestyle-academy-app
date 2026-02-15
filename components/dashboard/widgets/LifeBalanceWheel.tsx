
import React, { useState, useEffect, useMemo } from 'react';

interface BalanceData {
  Health: number;
  Career: number;
  Relationships: number;
  Growth: number;
  Finance: number;
  Recreation: number;
  Environment: number;
  Spirituality: number;
}

const LifeBalanceWheel: React.FC = () => {
  const [data, setData] = useState<BalanceData>({
    Health: 7,
    Career: 6,
    Relationships: 8,
    Growth: 7,
    Finance: 5,
    Recreation: 6,
    Environment: 7,
    Spirituality: 6,
  });

  const [activeCategory, setActiveCategory] = useState<keyof BalanceData | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('balanceWheelData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  const handleValueChange = (category: keyof BalanceData, value: number) => {
    const newData = { ...data, [category]: value };
    setData(newData);
    localStorage.setItem('balanceWheelData', JSON.stringify(newData));
  };

  const categories = Object.keys(data) as Array<keyof BalanceData>;
  const totalCategories = categories.length;
  const radius = 100;
  const centerX = 150;
  const centerY = 150;
  const angleStep = (Math.PI * 2) / totalCategories;

  const getCoordinates = (value: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2; // Start at top (-90deg)
    const r = (value / 10) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = useMemo(() => {
    return categories
      .map((cat, i) => {
        const { x, y } = getCoordinates(data[cat], i);
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, categories]);

  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <div className="bento-card h-full flex flex-col">
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Life Balance Wheel</h2>
      
      <div className="flex flex-col lg:flex-row items-center gap-8 h-full">
        {/* Chart Side */}
        <div className="relative flex-shrink-0">
          <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
            {/* Background Grid Webs */}
            {gridLevels.map((level) => (
              <polygon
                key={level}
                points={categories
                  .map((_, i) => {
                    const { x, y } = getCoordinates(level, i);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Axes */}
            {categories.map((_, i) => {
              const { x, y } = getCoordinates(10, i);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(127, 90, 240, 0.2)"
              stroke="var(--primary)"
              strokeWidth="2"
              className="transition-all duration-500 ease-out"
            />

            {/* Data Points */}
            {categories.map((cat, i) => {
              const { x, y } = getCoordinates(data[cat], i);
              return (
                <g key={cat} className="group cursor-pointer" onClick={() => setActiveCategory(cat)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={activeCategory === cat ? 6 : 4}
                    fill={activeCategory === cat ? 'var(--accent)' : 'var(--primary)'}
                    className="transition-all duration-200"
                  />
                  {/* Label */}
                  <text
                    x={(() => {
                        const angle = i * angleStep - Math.PI / 2;
                        return centerX + (radius + 25) * Math.cos(angle);
                    })()}
                    y={(() => {
                        const angle = i * angleStep - Math.PI / 2;
                        return centerY + (radius + 25) * Math.sin(angle);
                    })()}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-[10px] uppercase font-bold tracking-wider fill-[var(--muted)] transition-colors ${activeCategory === cat ? 'fill-[var(--primary)]' : ''}`}
                  >
                    {cat}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Controls Side */}
        <div className="flex-1 w-full space-y-3 overflow-y-auto max-h-[300px] pr-2">
          {categories.map((cat) => (
            <div 
                key={cat} 
                className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    activeCategory === cat 
                    ? 'bg-[var(--secondary)]/30 border-[var(--primary)]' 
                    : 'bg-[var(--background)] border-transparent hover:border-[var(--border)]'
                }`}
                onClick={() => setActiveCategory(cat)}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-sm text-[var(--foreground)]">{cat}</label>
                <span className="font-bold text-[var(--primary)]">{data[cat]}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={data[cat]}
                onChange={(e) => handleValueChange(cat, parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LifeBalanceWheel;
