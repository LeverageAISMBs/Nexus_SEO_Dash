import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-nexus-800/50 backdrop-blur-md border border-nexus-700/50 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "ai";
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral" }) => {
  const styles = {
    neutral: "bg-nexus-700 text-gray-300",
    success: "bg-emerald-900/30 text-emerald-400 border border-emerald-800",
    warning: "bg-amber-900/30 text-amber-400 border border-amber-800",
    danger: "bg-rose-900/30 text-rose-400 border border-rose-800",
    ai: "bg-violet-900/30 text-violet-400 border border-violet-800"
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const ScoreGauge = ({ score, label, subLabel }: { score: number, label: string, subLabel?: string }) => {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  
  let color = "stroke-rose-500";
  if (score > 50) color = "stroke-amber-500";
  if (score > 85) color = "stroke-emerald-500";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            className="text-nexus-700 stroke-current"
            strokeWidth="8"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          {/* Progress Circle */}
          <circle
            className={`${color} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-3xl font-bold">{score}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-gray-300">{label}</div>
        {subLabel && <div className="text-xs text-gray-500">{subLabel}</div>}
      </div>
    </div>
  );
};

export const ProgressBar = ({ progress, status }: { progress: number, status: string }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-nexus-accent animate-pulse">{status}</span>
      <span className="text-sm font-medium text-gray-400">{progress}%</span>
    </div>
    <div className="w-full bg-nexus-700 rounded-full h-2.5">
      <div 
        className="bg-nexus-accent h-2.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse-fast"></div>
      </div>
    </div>
  </div>
);

export const SectionHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
    {subtitle && <p className="text-nexus-700 text-sm mt-1">{subtitle}</p>}
  </div>
);