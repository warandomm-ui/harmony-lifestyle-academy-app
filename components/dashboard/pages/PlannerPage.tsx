import React from 'react';
import TimeTableSection from '../sections/TimeTableSection';
import EmotionTrackerSection from '../sections/EmotionTrackerSection';
import TodoListSection from '../sections/TodoListSection';
import { ClipboardCheckIcon } from '../Icons';

const PlannerPage: React.FC = () => {
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[var(--background)]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-3">
          <ClipboardCheckIcon className="h-8 w-8 text-[var(--primary)]" />
          Daily Planner
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimeTableSection />
          </div>
          <div className="lg:col-span-1 grid grid-cols-1 gap-6">
            <EmotionTrackerSection />
            <TodoListSection />
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlannerPage;
