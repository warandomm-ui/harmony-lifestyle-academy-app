import React from 'react';
import { ChatAlt2Icon, DocumentTextIcon, UsersIcon } from '../Icons';

const CommunicationPage: React.FC = () => {
  const communicationAreas = [
    {
      icon: <UsersIcon className="h-10 w-10 text-purple-500" />,
      title: "Public Speaking Practice",
      description: "Practice presentation scenarios, get AI feedback on your pacing and clarity, and build confidence for your next speech.",
      action: "Start Practice"
    },
    {
      icon: <DocumentTextIcon className="h-10 w-10 text-blue-500" />,
      title: "AI Writing Assistant",
      description: "Improve your essays, emails, and reports. Get suggestions on tone, grammar, and structure to write more effectively.",
      action: "Open Assistant"
    },
    {
      icon: <ChatAlt2Icon className="h-10 w-10 text-green-500" />,
      title: "Active Listening Scenarios",
      description: "Engage in simulated conversations to develop skills in understanding others, asking better questions, and building stronger relationships.",
      action: "Begin Scenario"
    }
  ];

  return (
    <div className="space-y-6">
        <div className="bento-card text-center">
            <ChatAlt2Icon className="h-12 w-12 text-[var(--primary)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Mastering Communication</h2>
            <p className="text-[var(--muted)] mt-2 max-w-2xl mx-auto">
                Effective communication is a superpower. Use these tools to improve your public speaking, writing, and interpersonal skills.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communicationAreas.map(area => (
              <div key={area.title} className="bento-card flex flex-col text-center items-center">
                <div className="mb-4">{area.icon}</div>
                <h3 className="font-bold text-lg text-[var(--foreground)]">{area.title}</h3>
                <p className="text-sm text-[var(--muted)] mt-2 flex-grow">{area.description}</p>
                <button className="mt-6 bg-[var(--primary)] text-white font-bold py-2 px-6 rounded-full hover:opacity-90 transition w-full">
                  {area.action}
                </button>
              </div>
            ))}
        </div>
    </div>
  );
};

export default CommunicationPage;