import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  FileText, 
  Zap, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { AuditStatus, WebsiteAudit } from './types';
import { crawlWebsite } from './services/crawlerService';
import { generateAuditInsights } from './services/geminiService';
import { ProgressBar, Card } from './components/UIComponents';
import { DashboardView, TechnicalView, AIStrategyView } from './components/AuditViews';

const App = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<AuditStatus>(AuditStatus.IDLE);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [auditData, setAuditData] = useState<WebsiteAudit | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStartAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Reset
    setStatus(AuditStatus.CRAWLING);
    setProgress(10);
    setAuditData(null);
    setActiveTab('dashboard');

    try {
      // 1. Simulate Crawl
      const crawlResult = await crawlWebsite(url);
      setProgress(50);
      setStatus(AuditStatus.ANALYZING);

      // Simulate some processing time
      await new Promise(r => setTimeout(r, 800));
      setProgress(70);
      setStatus(AuditStatus.AI_GENERATING);

      // 2. Generate AI Insights
      const insights = await generateAuditInsights(crawlResult);
      
      const finalAudit: WebsiteAudit = {
        ...crawlResult,
        aiAnalysis: insights
      };

      setAuditData(finalAudit);
      setProgress(100);
      setStatus(AuditStatus.COMPLETE);

    } catch (error) {
      console.error(error);
      setStatus(AuditStatus.ERROR);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'technical', label: 'Technical', icon: <Cpu size={20} /> },
    { id: 'content', label: 'Content', icon: <FileText size={20} /> },
    { id: 'ai', label: 'AI Strategy', icon: <Zap size={20} /> },
  ];

  const renderContent = () => {
    if (status === AuditStatus.IDLE) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
           <div className="w-24 h-24 rounded-full bg-nexus-accent/10 flex items-center justify-center mb-6 ring-4 ring-nexus-accent/20">
             <Search className="h-10 w-10 text-nexus-accent" />
           </div>
           <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-4">
             Nexus SEO Command Center
           </h1>
           <p className="text-gray-400 max-w-lg mx-auto text-lg mb-8">
             Enter a URL to unleash our autonomous auditing engine powered by Gemini AI.
           </p>
           <form onSubmit={handleStartAudit} className="w-full max-w-md relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-nexus-accent to-nexus-ai rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative flex bg-nexus-900 rounded-lg border border-nexus-700 overflow-hidden shadow-2xl">
               <div className="pl-4 py-4 text-gray-500">
                 <Globe size={20} />
               </div>
               <input 
                 type="url" 
                 placeholder="https://example.com" 
                 className="w-full bg-transparent border-none text-white px-4 focus:ring-0 focus:outline-none"
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 required
               />
               <button 
                 type="submit" 
                 className="bg-nexus-accent hover:bg-blue-600 text-white px-6 font-medium transition-colors flex items-center gap-2"
               >
                 Audit <ChevronRight size={16} />
               </button>
             </div>
           </form>
        </div>
      );
    }

    if (status !== AuditStatus.COMPLETE) {
      return (
        <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto p-6">
           <div className="w-full mb-8">
             <ProgressBar progress={progress} status={status.replace('_', ' ')} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
             {[1,2,3].map(i => (
               <div key={i} className="h-32 bg-nexus-800/50 rounded-xl animate-pulse"></div>
             ))}
           </div>
        </div>
      );
    }

    if (!auditData) return null;

    switch (activeTab) {
      case 'dashboard': return <DashboardView audit={auditData} />;
      case 'technical': return <TechnicalView audit={auditData} />;
      case 'ai': return <AIStrategyView audit={auditData} />;
      default: return <div className="text-center text-gray-500 mt-20">Module Under Construction</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-nexus-accent/30">
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-nexus-900/90 backdrop-blur border-r border-nexus-800 transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-nexus-800 flex items-center gap-3">
          <ShieldCheck className="text-nexus-accent h-8 w-8" />
          <span className="font-bold text-xl tracking-wide">NEXUS</span>
        </div>
        
        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              disabled={status !== AuditStatus.COMPLETE}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-nexus-800 text-nexus-accent border-l-2 border-nexus-accent' 
                  : 'text-gray-400 hover:bg-nexus-800/50 hover:text-gray-200'
                }
                ${status !== AuditStatus.COMPLETE ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-nexus-800">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nexus-accent to-purple-500"></div>
             <div className="text-xs">
               <div className="font-bold text-white">Guest User</div>
               <div className="text-gray-500">Pro Plan</div>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-nexus-800 bg-nexus-900/50 backdrop-blur flex items-center justify-between px-6 z-40">
           <button 
             className="md:hidden text-gray-400"
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
           >
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
           
           <div className="flex items-center gap-4 ml-auto">
              {status === AuditStatus.COMPLETE && (
                <button 
                  onClick={() => {
                    setStatus(AuditStatus.IDLE);
                    setAuditData(null);
                    setUrl('');
                  }}
                  className="text-xs text-gray-400 hover:text-white border border-nexus-700 px-3 py-1.5 rounded transition-colors"
                >
                  New Audit
                </button>
              )}
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">
             {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;