import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Clock, Target, CheckSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { PlannerTask, PlannerGoal, ScheduleItem } from '../../types';

const StudyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>(() => {
    const saved = localStorage.getItem('hla_planner_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Complete revision notes', completed: false, createdAt: new Date().toISOString() },
      { id: '2', text: 'Research university programs', completed: false, createdAt: new Date().toISOString() },
      { id: '3', text: 'Practice coding for 1 hour', completed: false, createdAt: new Date().toISOString() },
    ];
  });

  const [goals, setGoals] = useState<PlannerGoal[]>(() => {
    const saved = localStorage.getItem('hla_planner_goals');
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Complete all assessments', progress: 60, createdAt: new Date().toISOString() },
      { id: '2', text: 'Build portfolio project', progress: 30, createdAt: new Date().toISOString() },
    ];
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('hla_planner_schedule');
    return saved ? JSON.parse(saved) : [
      { id: '1', startTime: '08:00', endTime: '10:00', title: 'Morning Study Session' },
      { id: '2', startTime: '10:30', endTime: '12:00', title: 'Research & Reading' },
      { id: '3', startTime: '14:00', endTime: '16:00', title: 'Practice & Projects' },
    ];
  });

  const [newTask, setNewTask] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const persist = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [...tasks, { id: crypto.randomUUID(), text: newTask.trim(), completed: false, createdAt: new Date().toISOString() }];
    setTasks(updated);
    persist('hla_planner_tasks', updated);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    persist('hla_planner_tasks', updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    persist('hla_planner_tasks', updated);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const updated = [...goals, { id: crypto.randomUUID(), text: newGoal.trim(), progress: 0, createdAt: new Date().toISOString() }];
    setGoals(updated);
    persist('hla_planner_goals', updated);
    setNewGoal('');
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    persist('hla_planner_goals', updated);
  };

  const completedTasks = tasks.filter(t => t.completed).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          📅 Study Planner
        </h1>
        <p className="text-muted-foreground mt-1">Organize your schedule, goals, and tasks</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today&apos;s Schedule
          </h3>
          <div className="space-y-4">
            {schedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div>
                  <div className="font-medium">{item.startTime} – {item.endTime}</div>
                  <div className="text-sm text-muted-foreground">{item.title}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updated = schedule.filter(s => s.id !== item.id);
                    setSchedule(updated);
                    persist('hla_planner_schedule', updated);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-4 text-primary"
            onClick={() => {
              const title = prompt('Enter time block title:');
              if (title) {
                const updated = [...schedule, { id: crypto.randomUUID(), startTime: '00:00', endTime: '01:00', title }];
                setSchedule(updated);
                persist('hla_planner_schedule', updated);
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Time Block
          </Button>
        </motion.div>

        {/* Goals & Tasks */}
        <div className="space-y-6">
          {/* Goals */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Goals
            </h3>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{goal.text}</span>
                    <button onClick={() => deleteGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="New goal..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={addGoal} disabled={!newGoal.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div variants={itemVariants} className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-success" />
              Tasks
              <span className="text-xs text-muted-foreground ml-auto">
                {completedTasks}/{tasks.length}
              </span>
            </h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg group">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="New task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={addTask} disabled={!newTask.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyPlanner;
