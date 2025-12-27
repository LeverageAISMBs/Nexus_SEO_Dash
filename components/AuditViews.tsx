import React from 'react';
import { WebsiteAudit, Recommendation, Keyword, ImpactLevel, EffortLevel } from '../types';
import { Card, Badge, ScoreGauge } from './UIComponents';
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink, Zap, BarChart3, Clock, ArrowRight, Link as LinkIcon, Files } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Dashboard View ---
export const DashboardView = ({ audit }: { audit: WebsiteAudit }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-nexus-800 to-nexus-900 border-nexus-accent/20">
          <ScoreGauge score={audit.scores.overall} label="Overall Health" />
        </Card>
        <Card>
          <ScoreGauge score={audit.scores.technical} label="Technical SEO" subLabel={`${audit.technical.pageSpeed.score} Speed`} />
        </Card>
        <Card>
          <ScoreGauge score={audit.scores.onPage} label="On-Page" subLabel={`${audit.onPage.wordCount} words`} />
        </Card>
        <Card>
          <ScoreGauge score={audit.scores.content} label="Content" subLabel="AI Score" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-nexus-warning h-5 w-5" />
            Critical Issues
          </h3>
          <div className="space-y-3">
             {/* Logic to extract critical issues would go here, simplified for demo */}
             {!audit.technical.ssl.valid && (
                <div className="flex items-start gap-3 p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                  <XCircle className="text-red-500 h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-200">SSL Certificate Missing</div>
                    <div className="text-xs text-red-400">Security risk. Affects rankings significantly.</div>
                  </div>
                </div>
             )}
             {audit.technical.canonical.issues.length > 0 && (
               <div className="flex items-start gap-3 p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                 <Files className="text-red-500 h-5 w-5 mt-0.5" />
                 <div>
                   <div className="font-medium text-red-200">Canonical Tag Issue</div>
                   <div className="text-xs text-red-400">{audit.technical.canonical.issues[0]}</div>
                 </div>
               </div>
             )}
             {audit.technical.metaTags.description.length < 50 && (
               <div className="flex items-start gap-3 p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg">
                 <AlertTriangle className="text-amber-500 h-5 w-5 mt-0.5" />
                 <div>
                   <div className="font-medium text-amber-200">Short Meta Description</div>
                   <div className="text-xs text-amber-400">Current: {audit.technical.metaTags.description.length} chars. Target: 150-160.</div>
                 </div>
               </div>
             )}
             <div className="flex items-start gap-3 p-3 bg-nexus-700/30 rounded-lg">
                <CheckCircle2 className="text-nexus-success h-5 w-5 mt-0.5" />
                <span className="text-gray-400 text-sm">Sitemap detected and valid</span>
             </div>
          </div>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="h-24 w-24 text-nexus-ai" />
          </div>
          <h3 className="text-lg font-semibold mb-4 text-nexus-ai">AI Insights</h3>
          {audit.aiAnalysis.summary ? (
            <div className="space-y-4">
              <p className="text-gray-300 italic">"{audit.aiAnalysis.summary}"</p>
              {audit.aiAnalysis.industry && (
                <div className="mt-4">
                   <span className="text-xs uppercase tracking-wider text-gray-500">Classified Industry</span>
                   <div className="text-xl font-bold text-white">{audit.aiAnalysis.industry.primary}</div>
                   <div className="text-sm text-nexus-accent">{audit.aiAnalysis.industry.subCategory}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Generating insights...
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// --- Technical View ---
export const TechnicalView = ({ audit }: { audit: WebsiteAudit }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <h3 className="text-xl font-bold mb-6">Core Web Vitals</h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${audit.technical.pageSpeed.cwv.lcp < 2.5 ? 'text-nexus-success' : 'text-nexus-warning'}`}>
              {audit.technical.pageSpeed.cwv.lcp}s
            </div>
            <div className="text-sm text-gray-400 font-medium">LCP</div>
            <div className="text-xs text-gray-600 mt-1">Largest Contentful Paint</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${audit.technical.pageSpeed.cwv.fid < 100 ? 'text-nexus-success' : 'text-nexus-warning'}`}>
              {audit.technical.pageSpeed.cwv.fid}ms
            </div>
            <div className="text-sm text-gray-400 font-medium">FID</div>
            <div className="text-xs text-gray-600 mt-1">First Input Delay</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${audit.technical.pageSpeed.cwv.cls < 0.1 ? 'text-nexus-success' : 'text-nexus-warning'}`}>
              {audit.technical.pageSpeed.cwv.cls}
            </div>
            <div className="text-sm text-gray-400 font-medium">CLS</div>
            <div className="text-xs text-gray-600 mt-1">Cumulative Layout Shift</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Canonicalization</h3>
              <Badge variant={audit.technical.canonical.score === 100 ? 'success' : 'danger'}>
                  Score: {audit.technical.canonical.score}
              </Badge>
          </div>
          
          <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded">
                  <span className="text-gray-300">Canonical Tag Status</span>
                  <div className="flex items-center gap-2">
                      {audit.technical.canonical.present ? (
                          <CheckCircle2 className="text-nexus-success w-4 h-4" />
                      ) : (
                          <XCircle className="text-red-500 w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                          {audit.technical.canonical.present ? 'Present' : 'Missing'}
                      </span>
                  </div>
              </div>

              {audit.technical.canonical.url && (
                  <div className="p-3 bg-black/20 rounded flex items-start gap-2">
                       <LinkIcon className="w-4 h-4 text-nexus-accent mt-0.5 shrink-0" />
                       <div>
                         <span className="text-xs text-gray-500 uppercase block mb-1">Target URL</span>
                         <code className="text-xs text-blue-300 break-all font-mono">{audit.technical.canonical.url}</code>
                       </div>
                  </div>
              )}

              {audit.technical.canonical.issues.length > 0 && (
                  <div className="space-y-2 mt-2">
                      {audit.technical.canonical.issues.map((issue, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              {issue}
                          </div>
                      ))}
                  </div>
              )}
              
              {audit.technical.canonical.issues.length === 0 && (
                  <div className="text-sm text-nexus-success flex items-center gap-2 mt-4 p-2 bg-emerald-900/10 rounded border border-emerald-900/30">
                      <CheckCircle2 className="w-4 h-4" />
                      Canonical implementation passed validation.
                  </div>
              )}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Meta Data Analysis</h3>
          <div className="space-y-6">
            <div className="border-b border-nexus-700 pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-200">Title Tag</span>
                <Badge variant={audit.technical.metaTags.title.score > 50 ? 'success' : 'warning'}>
                  {audit.technical.metaTags.title.length} chars
                </Badge>
              </div>
              <div className="font-mono text-sm bg-black/30 p-3 rounded text-blue-300">
                {audit.technical.metaTags.title.content}
              </div>
              <ul className="mt-2 space-y-1">
                {audit.technical.metaTags.title.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-nexus-warning flex items-center gap-1">
                    <AlertTriangle size={12} /> {rec}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-200">Meta Description</span>
                <Badge variant={audit.technical.metaTags.description.score > 50 ? 'success' : 'warning'}>
                  {audit.technical.metaTags.description.length} chars
                </Badge>
              </div>
              <div className="font-mono text-sm bg-black/30 p-3 rounded text-gray-400">
                {audit.technical.metaTags.description.content}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- AI Strategy View ---
export const AIStrategyView = ({ audit }: { audit: WebsiteAudit }) => {
  if (!audit.aiAnalysis.recommendations) {
    return (
      <Card className="flex flex-col items-center justify-center py-20 text-center">
         <Zap className="h-12 w-12 text-gray-600 mb-4" />
         <p className="text-gray-400">AI Analysis pending...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <Zap className="text-nexus-ai" /> Strategic Recommendations
        </h3>
        <div className="grid gap-4">
          {audit.aiAnalysis.recommendations.map((rec) => (
            <Card key={rec.id} className="border-l-4 border-l-nexus-ai hover:bg-nexus-800 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-white group-hover:text-nexus-ai transition-colors">{rec.title}</h4>
                <div className="flex gap-2">
                  <Badge variant="neutral">{rec.category}</Badge>
                  <Badge variant={rec.impact === ImpactLevel.HIGH ? 'success' : 'warning'}>Impact: {rec.impact}</Badge>
                  <Badge variant="neutral">Effort: {rec.effort}</Badge>
                </div>
              </div>
              <p className="text-gray-400 mb-4">{rec.description}</p>
              
              <div className="bg-black/20 rounded p-4 mb-4">
                <h5 className="text-xs uppercase text-gray-500 font-bold mb-2">Action Plan</h5>
                <ol className="list-decimal list-inside space-y-1">
                  {rec.steps.map((step, idx) => (
                    <li key={idx} className="text-sm text-gray-300">{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock size={14} /> Est. Time: {rec.estimatedTime}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
           <BarChart3 className="text-nexus-success" /> Keyword Opportunities
        </h3>
        <Card>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={audit.aiAnalysis.keywordOpportunities}>
                <XAxis dataKey="phrase" hide />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                   {audit.aiAnalysis.keywordOpportunities?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.difficulty === 'Hard' ? '#ef4444' : entry.difficulty === 'Medium' ? '#f59e0b' : '#10b981'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
             {audit.aiAnalysis.keywordOpportunities?.map((k, i) => (
               <div key={i} className="flex justify-between items-center p-2 bg-nexus-900/50 rounded border border-nexus-700/50">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-200">{k.phrase}</span>
                    <span className="text-[10px] uppercase text-gray-500">{k.intent}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{k.volume.toLocaleString()}</div>
                    <div className={`text-[10px] ${k.difficulty === 'Hard' ? 'text-red-400' : 'text-emerald-400'}`}>{k.difficulty}</div>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};