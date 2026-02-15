
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ClockIcon, PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon, CloudIcon, SpinnerIcon } from '../Icons'; 
import { MOCK_TIMETABLE_DATA, TIMETABLE_ACTIVITY_TYPE_OPTIONS } from '../../../constants';
import type { TimeTableEntry } from '../../../types';
import { useToast } from '../../../contexts/ToastContext';

// --- Date Utility Functions ---
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const startOfWeek = (date: Date, firstDayOfWeek: 0 | 1 = 0) => { // 0 for Sunday, 1 for Monday
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = (day < firstDayOfWeek) ? (7 - firstDayOfWeek + day) : (day - firstDayOfWeek);
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - diff);
  return startOfDay(newDate);
};
const endOfWeek = (date: Date, firstDayOfWeek: 0 | 1 = 0) => {
  const start = startOfWeek(date, firstDayOfWeek);
  const newDate = new Date(start);
  newDate.setDate(start.getDate() + 6);
  return endOfDay(newDate);
};
const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};
const addMonths = (date: Date, months: number) => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
};
const formatDateToYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isToday = (date: Date) => isSameDay(date, new Date());


const TimeTableSection: React.FC = () => {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState<Date>(startOfDay(new Date()));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month'); // New state for view mode
  const [isSyncing, setIsSyncing] = useState(false);

  const [timetableEntries, setTimetableEntries] = useState<TimeTableEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formEntry, setFormEntry] = useState<{ date: string; time: string; activity: string; type: TimeTableEntry['type']; }>({
    date: formatDateToYYYYMMDD(new Date()),
    time: '',
    activity: '',
    type: 'study',
  });
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);


  // Load from local storage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('timetableEntries');
    if (storedEntries) {
      setTimetableEntries(JSON.parse(storedEntries));
    } else {
      setTimetableEntries(MOCK_TIMETABLE_DATA);
    }
  }, []);
  
  // Close date picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            setIsDatePickerOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Persist to local storage whenever entries change, and sort them
  useEffect(() => {
    const sortedEntries = [...timetableEntries].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time.split(' ')[0]}`); // Basic time parsing for comparison
      const dateB = new Date(`${b.date}T${b.time.split(' ')[0]}`);
      return dateA.getTime() - dateB.getTime();
    });
    localStorage.setItem('timetableEntries', JSON.stringify(sortedEntries));
  }, [timetableEntries]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormEntry(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date) => {
    setFormEntry(prev => ({ ...prev, date: formatDateToYYYYMMDD(date) }));
    setIsDatePickerOpen(false);
  };

  const getColorClassForType = (type: TimeTableEntry['type']) => {
    return TIMETABLE_ACTIVITY_TYPE_OPTIONS.find(opt => opt.type === type)?.colorClass || 'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-300';
  };

  const handleAddOrUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEntry.date.trim() || !formEntry.time.trim() || !formEntry.activity.trim()) {
      addToast('Date, Time, and Activity are required!', 'error');
      return;
    }

    if (editingEntryId) {
      // Update existing entry
      setTimetableEntries(prev => prev.map(entry =>
        entry.id === editingEntryId
          ? {
              ...entry,
              date: formEntry.date,
              time: formEntry.time,
              activity: formEntry.activity,
              type: formEntry.type,
              colorClass: getColorClassForType(formEntry.type),
            }
          : entry
      ));
      addToast('Timetable entry updated!', 'success');
    } else {
      // Add new entry
      const newEntry: TimeTableEntry = {
        id: Date.now().toString(),
        date: formEntry.date,
        time: formEntry.time,
        activity: formEntry.activity,
        type: formEntry.type,
        colorClass: getColorClassForType(formEntry.type),
      };
      setTimetableEntries(prev => [...prev, newEntry]);
      addToast('Timetable entry added!', 'success');
    }
    handleCloseForm();
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setTimetableEntries(prev => prev.filter(entry => entry.id !== id));
      addToast('Timetable entry deleted!', 'info');
      if (editingEntryId === id) {
          handleCloseForm();
      }
    }
  };

  const handleEditClick = (entry: TimeTableEntry) => {
    setEditingEntryId(entry.id);
    setFormEntry({ date: entry.date, time: entry.time, activity: entry.activity, type: entry.type });
    setShowForm(true);
  };

  const handleDayCellClick = (date: Date) => {
    setEditingEntryId(null);
    setFormEntry({ date: formatDateToYYYYMMDD(date), time: '', activity: '', type: 'study' });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEntryId(null);
    setFormEntry({ date: formatDateToYYYYMMDD(new Date()), time: '', activity: '', type: 'study' });
  };

  const handleSyncToGoogleCalendar = () => {
    setIsSyncing(true);
    // Simulate API latency
    setTimeout(() => {
      setIsSyncing(false);
      addToast('Timetable synced to Google Calendar successfully!', 'success');
    }, 2000);
  };

  const getEventsForDay = (date: Date) => {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return timetableEntries
      .filter(entry => isSameDay(new Date(new Date(entry.date).getTime() + timezoneOffset), date))
      .sort((a, b) => a.time.localeCompare(b.time));
  };
  
  const getDaysForMonthView = useCallback((month: Date) => {
    const startOfSelectedMonth = startOfMonth(month);
    const endOfSelectedMonth = endOfMonth(month);

    const firstDay = startOfWeek(startOfSelectedMonth);
    const lastDay = endOfWeek(endOfSelectedMonth);

    const days: Date[] = [];
    let day = firstDay;
    while (day <= lastDay) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, []);

  const getDaysForWeekView = useCallback((weekStart: Date) => {
    const days: Date[] = [];
    let day = startOfWeek(weekStart);
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, []);

  const daysInView = useMemo(() => {
    if (viewMode === 'month') {
      return getDaysForMonthView(currentDate);
    } else {
      return getDaysForWeekView(currentDate);
    }
  }, [viewMode, currentDate, getDaysForMonthView, getDaysForWeekView]);
  
  const daysInPicker = useMemo(() => getDaysForMonthView(pickerMonth), [pickerMonth, getDaysForMonthView]);


  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = addDays(weekStart, 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }, [viewMode, currentDate]);

  return (
    <div className="bento-card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <ClockIcon className="h-7 w-7 text-[var(--primary)]" />
            Timetable & Planner
        </h2>
        <button 
            onClick={handleSyncToGoogleCalendar}
            disabled={isSyncing}
            className="flex items-center gap-2 text-sm font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 px-4 py-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isSyncing ? <SpinnerIcon className="h-4 w-4" /> : <CloudIcon className="h-4 w-4" />}
            <span>{isSyncing ? 'Syncing...' : 'Sync to Google Calendar'}</span>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'month' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]/50 text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'week' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]/50 text-[var(--foreground)] hover:bg-[var(--secondary)]'}`}
            >
              Week
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, -1) : addDays(prev, -7))} className="p-1 rounded-full hover:bg-[var(--secondary)]">
              <ChevronLeftIcon className="h-5 w-5 text-[var(--foreground)]" />
            </button>
            <h3 className="font-bold text-lg text-[var(--foreground)]">{headerTitle}</h3>
            <button onClick={() => setCurrentDate(prev => viewMode === 'month' ? addMonths(prev, 1) : addDays(prev, 7))} className="p-1 rounded-full hover:bg-[var(--secondary)]">
              <ChevronRightIcon className="h-5 w-5 text-[var(--foreground)]" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px text-center text-xs font-semibold uppercase text-[var(--muted)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className={`grid gap-px ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7 grid-rows-1'}`}>
          {daysInView.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isSelectedDay = showForm && isSameDay(day, new Date(new Date(formEntry.date).getTime() + new Date(formEntry.date).getTimezoneOffset() * 60000));
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={index}
                onClick={() => handleDayCellClick(day)}
                className={`min-h-[100px] p-2 border border-[var(--border)] rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth || viewMode === 'week' ? 'bg-[var(--background)]' : 'bg-[var(--background)] opacity-50'}
                  ${isToday(day) ? 'ring-2 ring-[var(--primary)]' : ''}
                  ${isSelectedDay ? 'border-[var(--accent)] bg-[var(--accent)]/10' : ''}
                  hover:border-[var(--primary)]
                `}
              >
                <time className={`font-semibold ${isCurrentMonth || viewMode === 'week' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                  {day.getDate()}
                </time>
                <div className="mt-1 space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); handleEditClick(event); }}
                      className={`text-xs p-1 rounded-md cursor-pointer truncate hover:opacity-80
                        ${event.colorClass.replace('dark:bg-', 'dark:hover:bg-')}` // Apply color from constant
                      }
                    >
                      <span className="font-medium">{event.time.split(' ')[0]}</span> {event.activity}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
            <div className="mt-6 p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">{editingEntryId ? 'Edit Entry' : 'Add New Entry'}</h3>
                <form onSubmit={handleAddOrUpdateEntry} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="entry-date" className="block text-sm font-medium text-[var(--muted)]">Date</label>
                            <div className="relative mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const formDate = new Date(formEntry.date);
                                        const timezoneOffset = formDate.getTimezoneOffset() * 60000;
                                        setPickerMonth(new Date(formDate.getTime() + timezoneOffset));
                                        setIsDatePickerOpen(prev => !prev);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition flex justify-between items-center"
                                >
                                    <span>{new Date(new Date(formEntry.date).getTime() + new Date(formEntry.date).getTimezoneOffset() * 60000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <CalendarIcon className="h-5 w-5 text-[var(--muted)]" />
                                </button>
                                {isDatePickerOpen && (
                                    <div ref={datePickerRef} className="absolute z-20 mt-2 w-72 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)] p-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <button type="button" onClick={() => setPickerMonth(prev => addMonths(prev, -1))} className="p-1 rounded-full hover:bg-[var(--secondary)]"><ChevronLeftIcon /></button>
                                            <span className="font-bold text-sm">{pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                            <button type="button" onClick={() => setPickerMonth(prev => addMonths(prev, 1))} className="p-1 rounded-full hover:bg-[var(--secondary)]"><ChevronRightIcon /></button>
                                        </div>
                                        <div className="grid grid-cols-7 text-center text-xs text-[var(--muted)] mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {daysInPicker.map((day, i) => {
                                                const selectedDate = new Date(new Date(formEntry.date).getTime() + new Date(formEntry.date).getTimezoneOffset() * 60000);
                                                const isSelected = isSameDay(day, selectedDate);
                                                const isCurrent = isToday(day);
                                                const isCurrentMonth = day.getMonth() === pickerMonth.getMonth();
                                                
                                                let classes = "w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors ";
                                                if (isSelected) classes += "bg-[var(--primary)] text-white font-bold ";
                                                else if (isCurrent) classes += "ring-2 ring-[var(--primary)] ";
                                                else if (isCurrentMonth) classes += "hover:bg-[var(--secondary)] ";
                                                else classes += "text-[var(--muted)] hover:bg-[var(--secondary)] ";

                                                return (
                                                    <button type="button" key={i} onClick={() => handleDateChange(day)} className={classes}>
                                                        {day.getDate()}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-[var(--muted)]">Time</label>
                            <input type="text" id="time" name="time" value={formEntry.time} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition" placeholder="e.g., 08:00 AM - 09:00 AM" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="activity" className="block text-sm font-medium text-[var(--muted)]">Activity</label>
                        <input type="text" id="activity" name="activity" value={formEntry.activity} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition" placeholder="e.g., Python Programming" required />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-[var(--muted)]">Type</label>
                        <select id="type" name="type" value={formEntry.type} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition">
                            {TIMETABLE_ACTIVITY_TYPE_OPTIONS.map(opt => (
                                <option key={opt.type} value={opt.type}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                             {editingEntryId && (
                                <button type="button" onClick={() => handleDeleteEntry(editingEntryId)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={handleCloseForm} className="px-4 py-2 rounded-full font-bold text-[var(--foreground)] hover:bg-[var(--secondary)] transition">Cancel</button>
                            <button type="submit" className="bg-[var(--primary)] text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition">{editingEntryId ? 'Save Changes' : 'Add Entry'}</button>
                        </div>
                    </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default TimeTableSection;
