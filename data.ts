import { NavItem } from "./types";
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  FileText, 
  Zap, 
  Globe 
} from "lucide-react";

// Navigation Structure
// Developer Note: Modify this array to change the sidebar navigation.
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'technical', label: 'Technical Audit', icon: 'Cpu' },
  { id: 'content', label: 'Content Analysis', icon: 'FileText' },
  { id: 'ai', label: 'AI Strategy', icon: 'Zap' },
];

export const TOOLTIPS = {
  lcp: "Largest Contentful Paint: Measures loading performance. Target < 2.5s.",
  cls: "Cumulative Layout Shift: Measures visual stability. Target < 0.1.",
  fid: "First Input Delay: Measures interactivity. Target < 100ms.",
};

// Color mapping for scores
export const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-nexus-success border-nexus-success';
  if (score >= 60) return 'text-nexus-warning border-nexus-warning';
  return 'text-nexus-danger border-nexus-danger';
};

export const getScoreBg = (score: number) => {
  if (score >= 90) return 'bg-nexus-success';
  if (score >= 60) return 'bg-nexus-warning';
  return 'bg-nexus-danger';
};