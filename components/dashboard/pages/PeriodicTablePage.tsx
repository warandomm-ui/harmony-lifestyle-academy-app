import React, { useState } from 'react';

type Category =
  | 'alkali' | 'alkaline' | 'transition' | 'post' | 'metalloid'
  | 'nonmetal' | 'halogen' | 'noble' | 'lanthanide' | 'actinide';

interface Element {
  n: number;
  sym: string;
  name: string;
  cat: Category;
  mass: number;
  state: 'Solid' | 'Liquid' | 'Gas';
  eneg: number | string;
  valence: number;
  period: number;
  group: number | null;
  config: string;
  fact: string;
}

const ELEMENTS: Element[] = [
  { n: 1, sym: 'H', name: 'Hydrogen', cat: 'nonmetal', mass: 1.008, state: 'Gas', eneg: 2.2, valence: 1, period: 1, group: 1, config: '1s¹', fact: 'Hydrogen makes up 75% of all normal matter in the universe by mass. Water (H₂O) is the most important hydrogen compound.' },
  { n: 2, sym: 'He', name: 'Helium', cat: 'noble', mass: 4.003, state: 'Gas', eneg: '–', valence: 0, period: 1, group: 18, config: '1s²', fact: 'Helium is the second lightest element and has the lowest boiling point of any element (−269°C).' },
  { n: 3, sym: 'Li', name: 'Lithium', cat: 'alkali', mass: 6.941, state: 'Solid', eneg: 0.98, valence: 1, period: 2, group: 1, config: '[He] 2s¹', fact: 'KSSM Link: Lithium is used in rechargeable batteries. Li-ion batteries power phones, laptops, and electric cars.' },
  { n: 4, sym: 'Be', name: 'Beryllium', cat: 'alkaline', mass: 9.012, state: 'Solid', eneg: 1.57, valence: 2, period: 2, group: 2, config: '[He] 2s²', fact: 'Beryllium is one of the lightest metals. It is used in aerospace and nuclear applications.' },
  { n: 5, sym: 'B', name: 'Boron', cat: 'metalloid', mass: 10.81, state: 'Solid', eneg: 2.04, valence: 3, period: 2, group: 13, config: '[He] 2s² 2p¹', fact: 'Boron is used in Pyrex glass and as a hardening agent in alloys. Borax is a common boron compound.' },
  { n: 6, sym: 'C', name: 'Carbon', cat: 'nonmetal', mass: 12.011, state: 'Solid', eneg: 2.55, valence: 4, period: 2, group: 14, config: '[He] 2s² 2p²', fact: 'KSSM Link: Carbon forms millions of organic compounds. Diamond and graphite are both pure carbon with different structures (allotropes).' },
  { n: 7, sym: 'N', name: 'Nitrogen', cat: 'nonmetal', mass: 14.007, state: 'Gas', eneg: 3.04, valence: 3, period: 2, group: 15, config: '[He] 2s² 2p³', fact: 'KSSM Link: Nitrogen makes up 78% of Earth atmosphere. Essential for amino acids, proteins, and DNA.' },
  { n: 8, sym: 'O', name: 'Oxygen', cat: 'nonmetal', mass: 15.999, state: 'Gas', eneg: 3.44, valence: 2, period: 2, group: 16, config: '[He] 2s² 2p⁴', fact: 'KSSM Link: Oxygen is essential for combustion and respiration. 21% of atmosphere, 65% of human body by mass.' },
  { n: 9, sym: 'F', name: 'Fluorine', cat: 'halogen', mass: 18.998, state: 'Gas', eneg: 3.98, valence: 1, period: 2, group: 17, config: '[He] 2s² 2p⁵', fact: 'Fluorine is the most electronegative and reactive of all elements. Used in toothpaste to prevent cavities.' },
  { n: 10, sym: 'Ne', name: 'Neon', cat: 'noble', mass: 20.18, state: 'Gas', eneg: '–', valence: 0, period: 2, group: 18, config: '[He] 2s² 2p⁶', fact: 'Neon glows bright red-orange in neon signs when electricity passes through it. Inert and non-toxic.' },
  { n: 11, sym: 'Na', name: 'Sodium', cat: 'alkali', mass: 22.99, state: 'Solid', eneg: 0.93, valence: 1, period: 3, group: 1, config: '[Ne] 3s¹', fact: 'KSSM Link: Sodium chloride (NaCl) is table salt. Sodium reacts violently with water, producing NaOH and hydrogen gas.' },
  { n: 12, sym: 'Mg', name: 'Magnesium', cat: 'alkaline', mass: 24.305, state: 'Solid', eneg: 1.31, valence: 2, period: 3, group: 2, config: '[Ne] 3s²', fact: 'KSSM Link: Magnesium burns with a bright white flame. Used in sparklers and flares. Essential mineral in human body.' },
  { n: 13, sym: 'Al', name: 'Aluminium', cat: 'post', mass: 26.982, state: 'Solid', eneg: 1.61, valence: 3, period: 3, group: 13, config: '[Ne] 3s² 3p¹', fact: 'Aluminium is the most abundant metal in Earth crust. Lightweight, corrosion-resistant, and fully recyclable.' },
  { n: 14, sym: 'Si', name: 'Silicon', cat: 'metalloid', mass: 28.085, state: 'Solid', eneg: 1.9, valence: 4, period: 3, group: 14, config: '[Ne] 3s² 3p²', fact: 'KSSM Link: Silicon is the base of semiconductor technology — all computer chips are made from silicon. Also found in sand (SiO₂).' },
  { n: 15, sym: 'P', name: 'Phosphorus', cat: 'nonmetal', mass: 30.974, state: 'Solid', eneg: 2.19, valence: 3, period: 3, group: 15, config: '[Ne] 3s² 3p³', fact: 'Phosphorus is essential for DNA and ATP (energy currency of cells). White phosphorus glows in the dark.' },
  { n: 16, sym: 'S', name: 'Sulfur', cat: 'nonmetal', mass: 32.06, state: 'Solid', eneg: 2.58, valence: 2, period: 3, group: 16, config: '[Ne] 3s² 3p⁴', fact: 'KSSM Link: Sulfur is used in producing sulfuric acid (H₂SO₄), the most widely used industrial chemical in the world.' },
  { n: 17, sym: 'Cl', name: 'Chlorine', cat: 'halogen', mass: 35.45, state: 'Gas', eneg: 3.16, valence: 1, period: 3, group: 17, config: '[Ne] 3s² 3p⁵', fact: 'KSSM Link: Chlorine is used to purify drinking water and swimming pools. NaCl (table salt) contains chlorine.' },
  { n: 18, sym: 'Ar', name: 'Argon', cat: 'noble', mass: 39.948, state: 'Gas', eneg: '–', valence: 0, period: 3, group: 18, config: '[Ne] 3s² 3p⁶', fact: 'Argon makes up ~1% of the atmosphere. Used in welding to prevent oxidation of metals.' },
  { n: 19, sym: 'K', name: 'Potassium', cat: 'alkali', mass: 39.098, state: 'Solid', eneg: 0.82, valence: 1, period: 4, group: 1, config: '[Ar] 4s¹', fact: 'Potassium is essential for nerve and muscle function. Bananas are a good source of potassium.' },
  { n: 20, sym: 'Ca', name: 'Calcium', cat: 'alkaline', mass: 40.078, state: 'Solid', eneg: 1.0, valence: 2, period: 4, group: 2, config: '[Ar] 4s²', fact: 'KSSM Link: Calcium is vital for strong bones and teeth. Calcium carbonate (CaCO₃) forms limestone, marble, and chalk.' },
  { n: 26, sym: 'Fe', name: 'Iron', cat: 'transition', mass: 55.845, state: 'Solid', eneg: 1.83, valence: 2, period: 4, group: 8, config: '[Ar] 3d⁶ 4s²', fact: 'KSSM Link: Iron is the most used metal. Steel is an alloy of iron and carbon. Iron rusts in the presence of oxygen and water.' },
  { n: 29, sym: 'Cu', name: 'Copper', cat: 'transition', mass: 63.546, state: 'Solid', eneg: 1.9, valence: 2, period: 4, group: 11, config: '[Ar] 3d¹⁰ 4s¹', fact: 'KSSM Link: Copper is an excellent conductor of electricity and heat. Used in electrical wires and water pipes.' },
  { n: 30, sym: 'Zn', name: 'Zinc', cat: 'transition', mass: 65.38, state: 'Solid', eneg: 1.65, valence: 2, period: 4, group: 12, config: '[Ar] 3d¹⁰ 4s²', fact: 'Zinc is used to galvanize (coat) steel to prevent rusting. Important mineral for immune function.' },
  { n: 35, sym: 'Br', name: 'Bromine', cat: 'halogen', mass: 79.904, state: 'Liquid', eneg: 2.96, valence: 1, period: 4, group: 17, config: '[Ar] 3d¹⁰ 4s² 4p⁵', fact: 'Bromine is one of only two elements that are liquid at room temperature (the other is mercury).' },
  { n: 36, sym: 'Kr', name: 'Krypton', cat: 'noble', mass: 83.798, state: 'Gas', eneg: 3.0, valence: 0, period: 4, group: 18, config: '[Ar] 3d¹⁰ 4s² 4p⁶', fact: 'Krypton is used in high-performance flashlights and some lasers. Named after the Greek word for "hidden".' },
  { n: 47, sym: 'Ag', name: 'Silver', cat: 'transition', mass: 107.87, state: 'Solid', eneg: 1.93, valence: 1, period: 5, group: 11, config: '[Kr] 4d¹⁰ 5s¹', fact: 'Silver is the best electrical conductor of all metals. Used in jewelry, mirrors, and antibacterial applications.' },
  { n: 53, sym: 'I', name: 'Iodine', cat: 'halogen', mass: 126.9, state: 'Solid', eneg: 2.66, valence: 1, period: 5, group: 17, config: '[Kr] 4d¹⁰ 5s² 5p⁵', fact: 'KSSM Link: Iodine solution is used as an antiseptic. Starch turns dark blue/black in the presence of iodine — used as a test for starch.' },
  { n: 54, sym: 'Xe', name: 'Xenon', cat: 'noble', mass: 131.29, state: 'Gas', eneg: 2.6, valence: 0, period: 5, group: 18, config: '[Kr] 4d¹⁰ 5s² 5p⁶', fact: 'Xenon is used in high-intensity arc lamps, including the bright lights in car headlights and cinema projectors.' },
  { n: 79, sym: 'Au', name: 'Gold', cat: 'transition', mass: 196.97, state: 'Solid', eneg: 2.54, valence: 1, period: 6, group: 11, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', fact: 'Gold is one of the least reactive metals. Does not corrode or tarnish — used as currency for thousands of years.' },
  { n: 80, sym: 'Hg', name: 'Mercury', cat: 'transition', mass: 200.59, state: 'Liquid', eneg: 2.0, valence: 2, period: 6, group: 12, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', fact: 'Mercury is the only metal that is liquid at room temperature. Used in thermometers and fluorescent lamps (toxic — handle carefully!).' },
  { n: 82, sym: 'Pb', name: 'Lead', cat: 'post', mass: 207.2, state: 'Solid', eneg: 2.33, valence: 4, period: 6, group: 14, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', fact: 'KSSM Link: Lead is very dense and used in radiation shielding. Lead-acid batteries power car engines. Lead is toxic — no longer used in paints or petrol.' },
  { n: 92, sym: 'U', name: 'Uranium', cat: 'actinide', mass: 238.03, state: 'Solid', eneg: 1.38, valence: 6, period: 7, group: 3, config: '[Rn] 5f³ 6d¹ 7s²', fact: 'Uranium is the fuel for nuclear power plants. Nuclear fission of uranium releases enormous amounts of energy.' },
];

const LAYOUT: (number | 'La' | 'Ac' | 0)[][] = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
  [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
  [19, 20, 'La', 'Ac', 0, 0, 26, 0, 0, 29, 30, 0, 0, 0, 35, 0, 0, 36],
  [0, 0, 0, 0, 0, 0, 47, 0, 0, 0, 0, 0, 0, 0, 53, 0, 0, 54],
  [0, 0, 0, 0, 0, 0, 79, 80, 0, 82, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const CAT_META: Record<Category, { name: string; color: string }> = {
  alkali:     { name: 'Alkali Metal',          color: '#ef4444' },
  alkaline:   { name: 'Alkaline Earth Metal',  color: '#f97316' },
  transition: { name: 'Transition Metal',      color: '#C9A84C' },
  post:       { name: 'Post-Transition Metal', color: '#14B8A6' },
  metalloid:  { name: 'Metalloid',             color: '#8b5cf6' },
  nonmetal:   { name: 'Nonmetal',              color: '#22c55e' },
  halogen:    { name: 'Halogen',               color: '#3b82f6' },
  noble:      { name: 'Noble Gas',             color: '#ec4899' },
  lanthanide: { name: 'Lanthanide',            color: '#f59e0b' },
  actinide:   { name: 'Actinide',              color: '#06b6d4' },
};

const QUIZZES = [
  'Which element has the symbol Na and why is it different from its name?',
  'Which element burns with a bright white flame and is used in sparklers?',
  'Name two elements that are liquids at room temperature.',
  'Which element is the most electronegative? What does electronegativity mean?',
  'What is the electron configuration of Carbon (C)?',
  'Which element is used to galvanise steel to prevent rusting?',
  'Why is Silicon so important in modern technology?',
  'Which noble gas is found in neon signs? What colour does it glow?',
  'How can you test for the presence of starch using an element?',
  'What is the difference between Diamond and Graphite, even though both are pure Carbon?',
];

const elementMap: Record<number, Element> = {};
ELEMENTS.forEach(e => { elementMap[e.n] = e; });

interface PeriodicTablePageProps {
  onNavigate?: (view: string) => void;
}

export default function PeriodicTablePage({ onNavigate }: PeriodicTablePageProps) {
  const [selected, setSelected] = useState<Element | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-gray-200 p-4 md:p-6 font-mono">
      {/* Header */}
      <div className="text-center mb-6">
        {onNavigate && (
          <button
            onClick={() => onNavigate('school-subjects')}
            className="float-left text-xs text-gray-400 hover:text-[#C9A84C] border border-gray-700 hover:border-[#C9A84C] rounded px-2 py-1"
          >
            ← Back
          </button>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-[#C9A84C] tracking-widest" style={{ fontFamily: 'Syne, sans-serif' }}>
          ⚗ PERIODIC TABLE
        </h1>
        <p className="text-xs text-gray-500 tracking-widest mt-1">
          HARMONY LIFESTYLE ACADEMY · CHEMISTRY · KSSM
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center mb-5 max-w-4xl mx-auto">
        {(Object.keys(CAT_META) as Category[]).map(cat => (
          <div key={cat} className="flex items-center gap-1.5 text-[0.65rem] text-gray-400">
            <div className="w-3 h-3 rounded-sm" style={{ background: CAT_META[cat].color }} />
            {CAT_META[cat].name}
          </div>
        ))}
      </div>

      {/* Periodic Table Grid */}
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-1 mx-auto"
          style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', minWidth: '900px', maxWidth: '1100px' }}
        >
          {LAYOUT.map((row, ri) =>
            row.map((cell, ci) => {
              const key = `${ri}-${ci}`;
              if (cell === 0) {
                return <div key={key} className="aspect-square" />;
              }
              if (cell === 'La') {
                return (
                  <div
                    key={key}
                    className="aspect-square flex items-center justify-center text-[0.5rem] text-amber-400/60 border border-dashed border-amber-500/40 rounded bg-amber-500/5"
                  >
                    57-71
                  </div>
                );
              }
              if (cell === 'Ac') {
                return (
                  <div
                    key={key}
                    className="aspect-square flex items-center justify-center text-[0.5rem] text-cyan-400/60 border border-dashed border-cyan-500/40 rounded bg-cyan-500/5"
                  >
                    89-103
                  </div>
                );
              }
              const el = elementMap[cell];
              if (!el) return <div key={key} className="aspect-square" />;
              const meta = CAT_META[el.cat];
              const isSelected = selected?.n === el.n;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(el)}
                  className={`aspect-square flex flex-col items-center justify-center rounded border transition-all duration-150 hover:scale-110 hover:z-10 cursor-pointer p-0.5 ${
                    isSelected ? 'scale-110 z-20 ring-2 ring-[#C9A84C]' : ''
                  }`}
                  style={{
                    background: `${meta.color}15`,
                    borderColor: meta.color,
                  }}
                >
                  <span className="text-[0.45rem] text-gray-400 leading-none">{el.n}</span>
                  <span className="text-sm md:text-base font-bold text-white leading-tight">{el.sym}</span>
                  <span className="text-[0.35rem] text-gray-500 leading-none truncate w-full text-center">
                    {el.name.substring(0, 5)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="max-w-3xl mx-auto mt-6 bg-[#161625] border border-[#C9A84C]/60 rounded-xl p-5" style={{ animation: 'fadeIn 0.2s ease' }}>
          <button
            onClick={() => setSelected(null)}
            className="float-right text-xs text-gray-400 hover:text-[#C9A84C] border border-gray-700 hover:border-[#C9A84C] rounded px-2 py-1"
          >
            ✕ close
          </button>
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-lg flex flex-col items-center justify-center flex-shrink-0 border-2"
              style={{
                background: `${CAT_META[selected.cat].color}25`,
                borderColor: CAT_META[selected.cat].color,
              }}
            >
              <span className="text-2xl font-bold text-white leading-none">{selected.sym}</span>
              <span className="text-[0.6rem] text-gray-400">#{selected.n}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#C9A84C]" style={{ fontFamily: 'Syne, sans-serif' }}>
                {selected.name}
              </h3>
              <p className="text-xs text-gray-400">{CAT_META[selected.cat].name}</p>
              <p className="text-[0.65rem] text-[#C9A84C] mt-1 font-mono">{selected.config}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'Atomic Mass', value: `${selected.mass} u` },
              { label: 'Period', value: `Period ${selected.period}` },
              { label: 'Group', value: selected.group ?? '–' },
              { label: 'State', value: selected.state },
              { label: 'Electronegativity', value: selected.eneg },
              { label: 'Valence e⁻', value: selected.valence },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0d0d1a] rounded-md p-2 text-center">
                <div className="text-[0.55rem] text-gray-500 uppercase tracking-wider">{stat.label}</div>
                <div className="text-sm font-bold text-[#C9A84C] mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0d0d1a] rounded-md p-3 mt-3 text-xs text-gray-400 leading-relaxed border-l-4 border-[#14B8A6]">
            <span className="text-[#14B8A6] font-bold">💡 </span>
            {selected.fact}
          </div>
        </div>
      )}

      {/* Quiz Bar */}
      <div className="max-w-3xl mx-auto bg-[#161625] border border-[#14B8A6]/60 rounded-lg p-3 mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="text-[#14B8A6] font-bold">🧠 HLA Challenge:</span>
        <span className="flex-1 min-w-[200px]">{QUIZZES[quizIndex]}</span>
        <button
          onClick={() => setQuizIndex((quizIndex + 1) % QUIZZES.length)}
          className="bg-[#14B8A6]/15 border border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6]/30 rounded-md px-3 py-1 text-[0.65rem] font-bold"
        >
          New Quiz →
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
