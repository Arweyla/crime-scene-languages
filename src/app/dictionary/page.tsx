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
  Inbox
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 pt-12 pb-8 px-6 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-zinc-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <BookOpen className="text-blue-500 w-8 h-8" />
                  Personal Dictionary
                </h1>
                <p className="text-zinc-500 text-sm font-medium mt-1">
                  Words you've encountered in the field.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 md:flex-initial min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search words..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="recent">Most Recent</option>
                <option value="clicked">Most Clicked</option>
                <option value="alpha">Alphabetical</option>
              </select>

              {languages.length > 0 && (
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all uppercase font-bold text-xs"
                >
                  <option value="all">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!user ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <h2 className="text-2xl font-bold mb-4">Bureau Access Required</h2>
            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
              You must be logged in to access your personal dictionary and track your progress.
            </p>
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all inline-flex items-center gap-2"
            >
              Sign In
            </Link>
          </div>
        ) : filteredWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => (
              <div 
                key={word.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {word.language_code}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" />
                    {word.click_count} clicks
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1 text-white group-hover:text-blue-400 transition-colors">
                  {word.word_target}
                </h3>
                <p className="text-zinc-400 font-medium mb-4 italic">
                  {word.translation_native}
                </p>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(word.last_seen).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-zinc-300">No Intelligence Gathered</h2>
            <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
              {searchTerm 
                ? "No matching words found in your archives." 
                : "Solve your first case to start building your personal dictionary of intel."}
            </p>
            {!searchTerm && (
              <Link 
                href="/" 
                className="mt-8 text-blue-500 font-bold hover:underline inline-flex items-center gap-2"
              >
                Go to the Bureau
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
