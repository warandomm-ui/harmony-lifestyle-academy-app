
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ClipboardCheckIcon, SearchIcon, BellIcon, XIcon, SparklesIcon } from '../Icons';
import type { TodoItem } from '../../../types';
import { TODO_PRIORITY_OPTIONS } from '../../../constants';
import { useGamification } from '../../../contexts/GamificationContext';

// --- Date Utility Functions ---
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

const TodoListSection: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<TodoItem['priority']>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newLinkedGoal, setNewLinkedGoal] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  
  // Alarm State
  const [activeAlarm, setActiveAlarm] = useState<TodoItem | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { addPoints } = useGamification();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load todos from local storage
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
    // Initialize audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Gentle bell chime
  }, []);

  useEffect(() => {
    // Save todos to local storage whenever they change
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // --- ALARM LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const currentDate = now.toISOString().split('T')[0];

        const matchingTodo = todos.find(todo => 
            !todo.completed && 
            todo.dueDate === currentDate && 
            todo.reminderTime === currentTime &&
            activeAlarm?.id !== todo.id // Prevent re-triggering same alarm instantly
        );

        if (matchingTodo) {
            triggerAlarm(matchingTodo);
        }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [todos, activeAlarm]);

  const triggerAlarm = (todo: TodoItem) => {
      setActiveAlarm(todo);
      
      // 1. Play chime
      if (audioRef.current) {
          audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
      }

      // 2. Speak message with TTS
      const text = `Reminder: It's time for ${todo.text}. ${todo.linkedGoal ? `Remember, your goal is: ${todo.linkedGoal}` : ''}`;
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9; // Slightly slower for clarity
          window.speechSynthesis.speak(utterance);
      }
  };

  const dismissAlarm = () => {
      setActiveAlarm(null);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      window.speechSynthesis.cancel();
  };

  const sortTodosByPriority = (items: TodoItem[]): TodoItem[] => {
    const priorityOrder: Record<TodoItem['priority'], number> = { 'high': 3, 'medium': 2, 'low': 1 };
    return [...items].sort((a, b) => {
      // 1. Incomplete tasks before completed tasks
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      if (a.completed) return 0;

      // 2. Sort by due date
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (dateA !== dateB) {
          return dateA - dateB;
      }

      // 3. Sort by priority
      const pA = priorityOrder[a.priority];
      const pB = priorityOrder[b.priority];
      if (pA !== pB) {
          return pB - pA;
      }

      return 0; 
    });
  };
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTodos(prevTodos => {
        const updatedTodos = [
          ...prevTodos,
          { 
              id: Date.now().toString(), 
              text: newTask.trim(), 
              completed: false, 
              priority: newPriority, 
              dueDate: newDueDate || undefined,
              reminderTime: newReminderTime || undefined,
              linkedGoal: newLinkedGoal.trim() || undefined
          },
        ];
        return sortTodosByPriority(updatedTodos);
      });
      setNewTask('');
      setNewPriority('medium');
      setNewDueDate('');
      setNewReminderTime('');
      setNewLinkedGoal('');
      setShowExtras(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    if (activeAlarm?.id === id) dismissAlarm();
    
    setTodos(prevTodos => {
      const todoToToggle = prevTodos.find(todo => todo.id === id);
      if (todoToToggle && !todoToToggle.completed) {
        addPoints(10, 'completing a task');
      }
      
      const updatedTodos = prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      return sortTodosByPriority(updatedTodos);
    });
  };

  const getPriorityColorClass = (priority: TodoItem['priority']) => {
    return TODO_PRIORITY_OPTIONS.find(opt => opt.priority === priority)?.colorClass || 'bg-gray-400';
  };
  
  const formatDueDate = (dueDate: string, reminderTime?: string) => {
    const today = startOfDay(new Date());
    const [year, month, day] = dueDate.split('-').map(Number);
    const date = startOfDay(new Date(year, month - 1, day));
    
    const isPastDue = !isSameDay(date, today) && date < today;
    const isTodayDate = isSameDay(date, today);

    const formattedDate = date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
    });

    return {
        formattedDate: reminderTime ? `${formattedDate} @ ${reminderTime}` : formattedDate,
        isPastDue,
        isToday: isTodayDate,
    };
  };

  const completedTodosCount = todos.filter(todo => todo.completed).length;

  const sortedAndFilteredTodos = useMemo(() => {
    const items = searchTerm.trim()
      ? todos.filter(todo => todo.text.toLowerCase().includes(searchTerm.toLowerCase()))
      : todos;
    return sortTodosByPriority(items);
  }, [todos, searchTerm]);

  return (
    <div className="bento-card relative">
        {/* Alarm Modal Overlay */}
        {activeAlarm && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in-fast">
                <div className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center mb-6 animate-bounce">
                    <BellIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Reminder: {activeAlarm.text}</h3>
                {activeAlarm.linkedGoal && (
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 mt-2">
                        <p className="text-gray-300 text-xs uppercase font-bold mb-1">Why you're doing this:</p>
                        <p className="text-white font-medium text-lg">"{activeAlarm.linkedGoal}"</p>
                    </div>
                )}
                <div className="flex gap-4 mt-8 w-full">
                    <button 
                        onClick={dismissAlarm}
                        className="flex-1 py-3 rounded-full bg-gray-600 text-white font-bold hover:bg-gray-500 transition"
                    >
                        Snooze
                    </button>
                    <button 
                        onClick={() => handleToggleComplete(activeAlarm.id)}
                        className="flex-1 py-3 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition"
                    >
                        Complete Task
                    </button>
                </div>
            </div>
        )}

        <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <ClipboardCheckIcon className="h-7 w-7 text-[var(--accent)]" />
            Daily To-Do List
        </h2>
        
        <div className="relative mb-4">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-4 py-2.5 pl-10 rounded-full bg-[var(--background)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-[var(--muted)]" />
            </div>
        </div>

        <div className="space-y-4">
            {/* Add New Task */}
            <div className="bg-[var(--secondary)]/30 p-4 rounded-xl border border-[var(--border)]">
                <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                    <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--card)] border-2 border-transparent focus:border-[var(--primary)] focus:outline-none transition"
                    />
                    
                    {showExtras && (
                        <div className="grid grid-cols-1 gap-3 animate-fade-in-fast">
                            <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="text-xs font-bold text-[var(--muted)] ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={newDueDate}
                                        onChange={(e) => setNewDueDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-bold text-[var(--muted)] ml-1">Reminder Time</label>
                                    <input
                                        type="time"
                                        value={newReminderTime}
                                        onChange={(e) => setNewReminderTime(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm"
                                    />
                                 </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[var(--muted)] ml-1 flex items-center gap-1">
                                    <SparklesIcon className="h-3 w-3 text-[var(--primary)]" />
                                    My Goal / Motivation
                                </label>
                                <input
                                    type="text"
                                    value={newLinkedGoal}
                                    onChange={(e) => setNewLinkedGoal(e.target.value)}
                                    placeholder="e.g., To achieve straight As"
                                    className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value as TodoItem['priority'])}
                                className="px-3 py-2 rounded-lg bg-[var(--card)] border-2 border-transparent focus:border-[var(--primary)] focus:outline-none transition text-sm"
                            >
                                {TODO_PRIORITY_OPTIONS.map(option => (
                                    <option key={option.priority} value={option.priority}>{option.label}</option>
                                ))}
                            </select>
                            <button 
                                type="button" 
                                onClick={() => setShowExtras(!showExtras)}
                                className={`p-2 rounded-lg transition-colors ${showExtras ? 'bg-[var(--primary)] text-white' : 'bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--card)]/80'}`}
                                title="Set Reminder & Goal"
                            >
                                <BellIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newTask.trim()}
                            className="bg-[var(--primary)] text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition disabled:bg-gray-400 dark:disabled:bg-gray-600"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>

            {/* Task Summary */}
            <div className="text-center text-[var(--muted)]">
                {todos.length === 0 ? (
                    <p>No tasks yet. You're all clear!</p>
                ) : searchTerm.trim() ? (
                    <p className="font-semibold">
                        Found {sortedAndFilteredTodos.length} matching task(s)
                    </p>
                ) : (
                    <p className="font-semibold">{completedTodosCount} of {todos.length} tasks completed</p>
                )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {sortedAndFilteredTodos.length > 0 ? (
                    sortedAndFilteredTodos.map(todo => {
                        const { formattedDate, isPastDue, isToday } = todo.dueDate ? formatDueDate(todo.dueDate, todo.reminderTime) : { formattedDate: null, isPastDue: false, isToday: false };
                        let dateColorClass = 'text-[var(--muted)]';
                        if (isPastDue) dateColorClass = 'text-red-500 font-semibold';
                        else if (isToday) dateColorClass = 'text-orange-500 font-semibold';

                        const isCompleted = todo.completed;

                        return (
                            <div
                                key={todo.id}
                                className={`group flex flex-col rounded-lg p-3 transition-all duration-300 ease-in-out border border-transparent hover:border-[var(--border)] ${
                                    isCompleted ? 'bg-green-500/10 opacity-70' : 'bg-[var(--secondary)]/50'
                                }`}
                            >
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => handleToggleComplete(todo.id)}
                                        className="w-5 h-5 accent-[var(--primary)] flex-shrink-0 cursor-pointer"
                                    />
                                    <span className={`ml-3 flex items-center gap-2 transition-colors duration-300 ${
                                        isCompleted ? 'text-[var(--muted)]' : 'text-[var(--foreground)]'
                                    }`}>
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getPriorityColorClass(todo.priority)}`}
                                            aria-label={`${todo.priority} priority`}
                                        ></span>
                                        <span className="relative font-medium">
                                            {todo.text}
                                            <span className={`absolute top-1/2 left-0 w-full h-[2px] bg-current transition-transform duration-300 origin-left ${
                                                isCompleted ? 'scale-x-100' : 'scale-x-0'
                                            }`} />
                                        </span>
                                    </span>
                                    <div className="ml-auto flex items-center gap-2">
                                        {todo.reminderTime && <BellIcon className="h-3 w-3 text-[var(--primary)]" />}
                                        {formattedDate && (
                                            <span className={`text-xs flex items-center gap-1 ${dateColorClass}`}>
                                                {formattedDate}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {todo.linkedGoal && (
                                    <p className="text-xs text-[var(--muted)] mt-1 ml-8 italic truncate flex items-center gap-1">
                                        <SparklesIcon className="h-3 w-3 text-[var(--accent)]" />
                                        Goal: {todo.linkedGoal}
                                    </p>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-[var(--muted)] py-4">
                        {searchTerm.trim() ? 'No tasks match your search.' : "You're all clear!"}
                    </p>
                )}
            </div>
        </div>
    </div>
  );
};

export default TodoListSection;
