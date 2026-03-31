'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { 
  Search, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Languages, 
  SortAsc,
  Loader2,
  Inbox,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface WordEncounter {
  id: string;
  word_target: string;
  translation_native: string;
  language_code: string;
  click_count: number;
  last_seen: string;
}

type SortOption = 'recent' | 'clicked' | 'alpha';

export default function DictionaryPage() {
  const { user, loading: authLoading } = useAuth();
  const [words, setWords] = useState<WordEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchWords() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('word_encounters')
          .select('*')
          .eq('user_id', user.id);

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          setWords(data);
          // Extract unique languages
          const uniqueLangs = Array.from(new Set(data.map(w => w.language_code)));
          setLanguages(uniqueLangs);
        }
      } catch (err) {
        console.error('Error fetching dictionary:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchWords();
    }
  }, [user, authLoading]);

  const filteredWords = words
    .filter(w => {
      const matchesSearch = w.word_target.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           w.translation_native.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLang = selectedLanguage === 'all' || w.language_code === selectedLanguage;
      return matchesSearch && matchesLang;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime();
      if (sortBy === 'clicked') return b.click_count - a.click_count;
      if (sortBy === 'alpha') return a.word_target.localeCompare(b.word_target);
      return 0;
    });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-neon-blue">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin opacity-50" />
          <div className="absolute inset-0 blur-xl bg-neon-blue/20 animate-pulse" />
        </div>
        <p className="mt-6 font-black uppercase tracking-[0.3em] text-xs">Accessing Intel Archives...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 bg-mesh-noir scanline relative overflow-hidden pb-32">
      {/* Header */}
      <div className="border-b border-white/5 bg-zinc-900/40 pt-12 pb-12 px-6 sticky top-0 z-50 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-start gap-6">
              <Link href="/" className="group mt-1">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-neon-blue/30 group-hover:bg-neon-blue/5 transition-all group-hover:scale-110 active:scale-95">
                  <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-neon-blue transition-colors" />
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-6 bg-neon-blue rounded-full" />
                  <h1 className="text-4xl font-black uppercase tracking-tightest leading-none">Archives</h1>
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest opacity-70">
                  Linguistic Intelligence Log
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 md:flex-initial min-w-[300px] group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 group-focus-within:text-neon-blue transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by word or meaning..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-neon-blue/50 focus:bg-zinc-900 transition-all shadow-inner"
                />
              </div>

              <div className="flex gap-2">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-zinc-950 border border-white/5 rounded-2xl py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:outline-none focus:border-neon-blue/50 focus:text-white transition-all appearance-none cursor-pointer"
                >
                  <option value="recent">Recent Intel</option>
                  <option value="clicked">Usage Rank</option>
                  <option value="alpha">A-Z Dossier</option>
                </select>

                {languages.length > 0 && (
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-zinc-950 border border-white/5 rounded-2xl py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-neon-blue focus:outline-none focus:border-neon-blue/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Global</option>
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {!user ? (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[40px] border border-white/5 backdrop-blur-md">
            <div className="w-20 h-20 bg-zinc-950 border border-case-red/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-case-red/5">
              <ShieldCheck className="w-10 h-10 text-case-red" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Access Denied</h2>
            <p className="text-zinc-500 mb-12 max-w-sm mx-auto font-medium">
              Detective, you must authenticate with the Bureau to access secure intelligence archives.
            </p>
            <Link 
              href="/login" 
              className="bg-white text-zinc-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-neon-blue hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
            >
              Authenticate
            </Link>
          </div>
        ) : filteredWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWords.map((word, idx) => (
              <div 
                key={word.id}
                className="group relative bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 transition-all duration-500 hover:border-neon-blue/30 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,242,255,0.05)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-blue/5 rounded-full blur-2xl group-hover:bg-neon-blue/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-lg border border-neon-blue/20">
                    {word.language_code}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-600 group-hover:text-neon-pink transition-colors text-[10px] font-black uppercase tracking-widest">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {word.click_count}
                  </div>
                </div>
                
                <h3 className="text-3xl font-black mb-2 text-white group-hover:text-neon-blue transition-colors leading-none tracking-tight">
                  {word.word_target}
                </h3>
                <p className="text-zinc-400 font-bold mb-8 italic text-lg opacity-80 group-hover:opacity-100 transition-opacity">
                  {word.translation_native}
                </p>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Clock className="w-3.5 h-3.5" />
                    LOGGED: {new Date(word.last_seen).toLocaleDateString()}
                  </div>
                  <div className="text-[8px] font-black text-zinc-800 tracking-[0.2em] uppercase">
                    ID_{word.id.slice(0, 4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[40px] border border-white/5">
            <div className="w-24 h-24 bg-zinc-950 border border-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Inbox className="w-10 h-10 text-zinc-800" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-zinc-400">Archive Empty</h2>
            <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed font-medium">
              {searchTerm 
                ? "Search yielded no results. The intel does not exist in our current records." 
                : "No intelligence has been gathered yet. Complete operations to populate your archives."}
            </p>
            {!searchTerm && (
              <Link 
                href="/" 
                className="mt-10 bg-zinc-900 border border-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-zinc-800 inline-flex items-center gap-3"
              >
                Go to Operations
                <ArrowRight className="w-4 h-4 text-neon-blue" />
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
