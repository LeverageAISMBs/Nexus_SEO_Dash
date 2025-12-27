import React from 'react';

export enum AuditStatus {
  IDLE = 'IDLE',
  CRAWLING = 'CRAWLING',
  ANALYZING = 'ANALYZING',
  AI_GENERATING = 'AI_GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export enum ImpactLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum EffortLevel {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface MetaTag {
  content: string;
  length: number;
  hasKeyword?: boolean;
  hasCTA?: boolean;
  score: number;
  recommendations: string[];
}

export interface CanonicalTag {
  present: boolean;
  url?: string;
  count: number;
  score: number;
  issues: string[];
}

export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
}

export interface HeaderTag {
  content: string;
  tag: string;
}

export interface SchemaError {
  type: string;
  message: string;
}

export interface IndustryClassification {
  primary: string;
  subCategory: string;
  confidence: number;
  reasoning: string;
}

export interface Recommendation {
  id: string;
  priority: number;
  title: string;
  impact: ImpactLevel;
  effort: EffortLevel;
  category: string;
  description: string;
  steps: string[];
  estimatedTime: string;
}

export interface Keyword {
  phrase: string;
  volume: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  intent: string;
}

export interface WebsiteAudit {
  id: string;
  websiteUrl: string;
  auditDate: string;
  
  technical: {
    ssl: { valid: boolean; score: number; issues: string[] };
    canonical: CanonicalTag;
    pageSpeed: { desktop: number; mobile: number; cwv: CoreWebVitals; score: number };
    mobileResponsive: { valid: boolean; score: number; issues: string[] };
    sitemap: { present: boolean; valid: boolean; url: string; score: number };
    schema: { types: string[]; valid: boolean; errors: SchemaError[]; score: number };
    metaTags: {
      title: MetaTag;
      description: MetaTag;
    };
  };

  onPage: {
    headers: { h1Count: number; structure: HeaderTag[]; score: number };
    internalLinks: { count: number; broken: number; score: number };
    images: { total: number; missingAlt: number; optimized: number; score: number };
    wordCount: number;
  };

  aiAnalysis: {
    industry?: IndustryClassification;
    recommendations?: Recommendation[];
    keywordOpportunities?: Keyword[];
    summary?: string;
  };

  scores: {
    overall: number;
    technical: number;
    onPage: number;
    content: number;
  };
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}