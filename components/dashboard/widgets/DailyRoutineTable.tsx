import React, { useState, useEffect } from 'react';
import { useGamification } from '../../../contexts/GamificationContext';
import { useToast } from '../../../contexts/ToastContext';

// --- Types ---
interface RoutineTask {
  id: string;
  time: string;
  task: string;
  category: 'solat' | 'ibadah' | 'health' | 'study' | 'life' | 'social';
  propheticNote: string;
  isFixed: boolean; // Fixed = cannot delete (like 5 prayers)
}

interface DayLog {
  [taskId: string]: boolean;
}

// --- Default Prophetic Routine ---
const DEFAULT_ROUTINE: RoutineTask[] = [
  // BEFORE SUBUH
  {
    id: 'tahajjud',
    time: '4:30 AM',
    task: 'Qiyamullail / Tahajjud',
    category: 'ibadah',
    propheticNote: 'Nabi ﷺ bangun sepertiga malam terakhir untuk solat malam',
    isFixed: false,
  },
  {
    id: 'subuh',
    time: '5:30 AM',
    task: 'Solat Subuh',
    category: 'solat',
    propheticNote: 'Nabi ﷺ solat Subuh berjemaah, kemudian duduk berzikir hingga matahari terbit',
    isFixed: true,
  },
  {
    id: 'azkar-pagi',
    time: '5:50 AM',
    task: 'Zikir & Doa Pagi',
    category: 'ibadah',
    propheticNote: 'Nabi ﷺ membaca zikir pagi selepas Subuh — perlindungan sepanjang hari',
    isFixed: false,
  },
  {
    id: 'isyraq',
    time: '6:30 AM',
    task: 'Solat Dhuha / Isyraq',
    category: 'ibadah',
    propheticNote: 'Nabi ﷺ solat Dhuha — sedekah untuk setiap sendi badan',
    isFixed: false,
  },
  // MORNING
  {
    id: 'workout',
    time: '6:45 AM',
    task: 'Senaman / Workout (30 min)',
    category: 'health',
    propheticNote: 'Nabi ﷺ menggalakkan kekuatan fizikal — memanah, berkuda, berenang',
    isFixed: false,
  },
  {
    id: 'breakfast',
    time: '7:30 AM',
    task: 'Sarapan Sihat (Sunnah food)',
    category: 'health',
    propheticNote: 'Nabi ﷺ makan kurma, madu, roti — makan sederhana, jangan berlebihan',
    isFixed: false,
  },
  {
    id: 'study-1',
    time: '8:00 AM',
    task: 'Belajar / Sekolah (Deep Focus)',
    category: 'study',
    propheticNote: 'Nabi ﷺ mengajar sahabat selepas Subuh — waktu pagi otak paling tajam',
    isFixed: false,
  },
  // ZOHOR
  {
    id: 'zohor',
    time: '1:00 PM',
    task: 'Solat Zohor',
    category: 'solat',
    propheticNote: 'Nabi ﷺ solat Zohor tepat waktu — jangan tangguh',
    isFixed: true,
  },
  {
    id: 'lunch',
    time: '1:30 PM',
    task: 'Makan Tengahari',
    category: 'health',
    propheticNote: 'Nabi ﷺ makan dengan tangan kanan, sebut Bismillah, duduk',
    isFixed: false,
  },
  {
    id: 'qailulah',
    time: '2:00 PM',
    task: 'Qailulah (Power Nap 20 min)',
    category: 'health',
    propheticNote: 'Nabi ﷺ tidur sebentar sebelum Zohor/Asar — recharge tenaga',
    isFixed: false,
  },
  // ASAR
  {
    id: 'asar',
    time: '4:00 PM',
    task: 'Solat Asar',
    category: 'solat',
    propheticNote: 'Nabi ﷺ peringatkan — jangan tinggalkan Asar, ia solat pertengahan',
    isFixed: true,
  },
  {
    id: 'quran',
    time: '4:30 PM',
    task: 'Baca Al-Quran (10-30 min)',
    category: 'ibadah',
    propheticNote: 'Nabi ﷺ membaca Quran setiap hari — setiap huruf 10 pahala',
    isFixed: false,
  },
  {
    id: 'skill',
    time: '5:00 PM',
    task: 'Latih Skill / Side Project',
    category: 'study',
    propheticNote: 'Nabi ﷺ galakkan belajar kemahiran — tangan yang memberi lebih baik',
    isFixed: false,
  },
  // MAGHRIB
  {
    id: 'maghrib',
    time: '7:15 PM',
    task: 'Solat Maghrib',
    category: 'solat',
    propheticNote: 'Nabi ﷺ segera solat Maghrib selepas azan — jangan lambat',
    isFixed: true,
  },
  {
    id: 'family',
    time: '7:45 PM',
    task: 'Masa Keluarga / Silaturahim',
    category: 'social',
    propheticNote: 'Nabi ﷺ meluangkan masa dengan keluarga setiap malam',
    isFixed: false,
  },
  // ISYAK
  {
    id: 'isyak',
    time: '8:30 PM',
    task: 'Solat Isyak',
    category: 'solat',
    propheticNote: 'Nabi ﷺ solat Isyak berjemaah, tidak suka bergadang selepasnya',
    isFixed: true,
  },
  {
    id: 'azkar-petang',
    time: '9:00 PM',
    task: 'Zikir Petang & Muhasabah',
    category: 'ibadah',
    propheticNote: 'Nabi ﷺ muhasabah diri — apa yang baik hari ini? Apa perlu diperbaiki?',
    isFixed: false,
  },
  {
    id: 'journal',
    time: '9:15 PM',
    task: 'Tulis Journal / Refleksi',
    category: 'life',
    propheticNote: 'Menulis membantu kejelasan fikiran — amalkan gratitude harian',
    isFixed: false,
  },
  {
    id: 'sleep',
    time: '10:00 PM',
    task: 'Tidur Awal (Wudhu + Doa Tidur)',
    category: 'life',
    propheticNote: 'Nabi ﷺ tidur awal, baring kanan, baca Ayatul Kursi & 3 Qul',
    isFixed: false,
  },
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  solat:  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: '🕌' },
  ibadah: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', icon: '📿' },
  health: { bg: 'bg-rose-500/15',   text: 'text-rose-400',   icon: '💪' },
  study:  { bg: 'bg-amber-500/15',  text: 'text-amber-400',  icon: '📚' },
  life:   { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   icon: '🌙' },
  social: { bg: 'bg-pink-500/15',   text: 'text-pink-400',   icon: '👨‍👩‍👧‍👦' },
};

// --- Helper ---
const getTodayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const STORAGE_KEY_ROUTINE = 'harmony_daily_routine';
const STORAGE_KEY_LOG = 'harmony_routine_log';

// --- Component ---
const DailyRoutineTable: React.FC = () => {
  const [routine, setRoutine] = useState<RoutineTask[]>([]);
  const [dayLog, setDayLog] = useState<DayLog>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState('');
  const [editTime, setEditTime] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<RoutineTask['category']>('life');
  const [showPropheticTip, setShowPropheticTip] = useState<string | null>(null);
  const { addPoints } = useGamification();
  const { addToast } = useToast();

  // Load routine & today's log
  useEffect(() => {
    const savedRoutine = localStorage.getItem(STORAGE_KEY_ROUTINE);
    if (savedRoutine) {
      try { setRoutine(JSON.parse(savedRoutine)); } catch { setRoutine(DEFAULT_ROUTINE); }
    } else {
      setRoutine(DEFAULT_ROUTINE);
    }

    const todayKey = getTodayKey();
    const savedLog = localStorage.getItem(`${STORAGE_KEY_LOG}_${todayKey}`);
    if (savedLog) {
      try { setDayLog(JSON.parse(savedLog)); } catch { setDayLog({}); }
    }
  }, []);

  // Save routine
  useEffect(() => {
    if (routine.length > 0) {
      localStorage.setItem(STORAGE_KEY_ROUTINE, JSON.stringify(routine));
    }
  }, [routine]);

  // Save day log
  useEffect(() => {
    const todayKey = getTodayKey();
    localStorage.setItem(`${STORAGE_KEY_LOG}_${todayKey}`, JSON.stringify(dayLog));
  }, [dayLog]);

  const toggleTask = (taskId: string) => {
    const newLog = { ...dayLog, [taskId]: !dayLog[taskId] };
    setDayLog(newLog);
    
    if (!dayLog[taskId]) {
      addPoints(5, 'completing routine task');
      // Check if it's a prayer
      const task = routine.find(t => t.id === taskId);
      if (task?.category === 'solat') {
        addPoints(10, `praying ${task.task}`);
      }
    }
  };

  const completedCount = Object.values(dayLog).filter(Boolean).length;
  const totalCount = routine.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Prayer specific count
  const prayerTasks = routine.filter(t => t.category === 'solat');
  const prayersDone = prayerTasks.filter(t => dayLog[t.id]).length;

  const startEdit = (task: RoutineTask) => {
    if (task.isFixed) return; // Can't edit fixed prayers
    setEditingId(task.id);
    setEditTask(task.task);
    setEditTime(task.time);
  };

  const saveEdit = (id: string) => {
    setRoutine(prev => prev.map(t => 
      t.id === id ? { ...t, task: editTask, time: editTime } : t
    ));
    setEditingId(null);
    addToast('Rutin dikemaskini ✅', 'success');
  };

  const deleteTask = (id: string) => {
    const task = routine.find(t => t.id === id);
    if (task?.isFixed) return;
    setRoutine(prev => prev.filter(t => t.id !== id));
    addToast('Rutin dipadam', 'info');
  };

  const addNewTask = () => {
    if (!newTask.trim() || !newTime.trim()) return;
    const id = `custom_${Date.now()}`;
    const newRoutineTask: RoutineTask = {
      id,
      time: newTime,
      task: newTask,
      category: newCategory,
      propheticNote: 'Tambahan peribadi kamu',
      isFixed: false,
    };
    setRoutine(prev => [...prev, newRoutineTask].sort((a, b) => {
      const timeA = a.time.replace(/[^0-9:]/g, '');
      const timeB = b.time.replace(/[^0-9:]/g, '');
      return timeA.localeCompare(timeB);
    }));
    setNewTask('');
    setNewTime('');
    setShowAdd(false);
    addToast('Rutin baru ditambah ✅', 'success');
  };

  const resetToDefault = () => {
    setRoutine(DEFAULT_ROUTINE);
    addToast('Rutin direset ke Sunnah default', 'info');
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/80 to-emerald-700/80 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕌</span>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Rutin Harian Sunnah</h2>
              <p className="text-emerald-200 text-xs">Ikut jadual Nabi Muhammad ﷺ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="text-[10px] font-bold text-emerald-200 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-400 transition-all"
            >
              Reset Sunnah
            </button>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-all"
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold text-emerald-100 mb-1">
              <span>{completedCount}/{totalCount} selesai</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-950/50 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${progressPercent}%`,
                  background: progressPercent === 100 
                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' 
                    : 'linear-gradient(90deg, #34d399, #10b981)'
                }}
              />
            </div>
          </div>
          <div className="text-center px-3 py-1 bg-emerald-800/50 rounded-xl border border-emerald-600/30">
            <p className="text-2xl font-black text-white">{prayersDone}/5</p>
            <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider">Solat</p>
          </div>
        </div>
      </div>

      {/* Add New Task Form */}
      {showAdd && (
        <div className="p-4 bg-[var(--secondary)]/50 border-b border-[var(--border)] animate-fade-in">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Masa (cth: 6:00 AM)"
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] w-32 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Apa nak buat?"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] flex-1 min-w-[150px] focus:outline-none focus:border-emerald-500"
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value as RoutineTask['category'])}
              className="px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
            >
              <option value="solat">🕌 Solat</option>
              <option value="ibadah">📿 Ibadah</option>
              <option value="health">💪 Kesihatan</option>
              <option value="study">📚 Belajar</option>
              <option value="life">🌙 Kehidupan</option>
              <option value="social">👨‍👩‍👧‍👦 Sosial</option>
            </select>
            <button
              onClick={addNewTask}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-all"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {/* Routine Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">✓</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Masa</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Rutin</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted)] hidden md:table-cell">Kategori</th>
              <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {routine.map((task) => {
              const isDone = dayLog[task.id] || false;
              const style = CATEGORY_STYLES[task.category];
              const isEditing = editingId === task.id;

              return (
                <React.Fragment key={task.id}>
                  <tr 
                    className={`border-b border-[var(--border)]/50 transition-all hover:bg-[var(--secondary)]/30 ${
                      isDone ? 'opacity-60' : ''
                    } ${task.category === 'solat' ? 'bg-emerald-500/5' : ''}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                            : 'border-[var(--border)] hover:border-emerald-400 text-transparent hover:text-emerald-300'
                        }`}
                      >
                        {isDone ? '✓' : ''}
                      </button>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editTime}
                          onChange={e => setEditTime(e.target.value)}
                          className="px-2 py-1 rounded bg-[var(--secondary)] border border-[var(--border)] text-sm w-24 text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <span className={`text-sm font-bold ${isDone ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>
                          {task.time}
                        </span>
                      )}
                    </td>

                    {/* Task */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editTask}
                          onChange={e => setEditTask(e.target.value)}
                          className="px-2 py-1 rounded bg-[var(--secondary)] border border-[var(--border)] text-sm w-full text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{style.icon}</span>
                          <span className={`text-sm font-bold ${isDone ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>
                            {task.task}
                          </span>
                          {task.isFixed && (
                            <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase">Wajib</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Category Badge */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
                        {task.category}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Prophetic tip button */}
                        <button
                          onClick={() => setShowPropheticTip(showPropheticTip === task.id ? null : task.id)}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-all text-sm"
                          title="Tip Sunnah"
                        >
                          ☀️
                        </button>

                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(task.id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all text-sm"
                            >
                              💾
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all text-sm"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            {!task.isFixed && (
                              <>
                                <button
                                  onClick={() => startEdit(task)}
                                  className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all text-sm"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all text-sm"
                                  title="Padam"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Prophetic Tip Row */}
                  {showPropheticTip === task.id && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3 animate-fade-in">
                          <span className="text-2xl">☀️</span>
                          <div>
                            <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">Amalan Nabi ﷺ</p>
                            <p className="text-sm text-amber-200/80">{task.propheticNote}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer: Motivational */}
      {progressPercent === 100 && (
        <div className="p-4 bg-gradient-to-r from-amber-900/30 to-amber-700/30 text-center animate-fade-in">
          <p className="text-amber-300 font-black text-lg">🏆 MashaAllah! Semua rutin selesai hari ini!</p>
          <p className="text-amber-200/60 text-xs mt-1">+{totalCount * 5} XP diperoleh. Istiqamah besok juga!</p>
        </div>
      )}

      {progressPercent > 0 && progressPercent < 100 && (
        <div className="p-3 text-center">
          <p className="text-[var(--muted)] text-xs">
            💡 <strong>Tip:</strong> Klik ☀️ untuk lihat amalan Nabi ﷺ bagi setiap rutin
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyRoutineTable;
