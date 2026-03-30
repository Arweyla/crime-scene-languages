'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import WordClicker from '@/components/WordClicker';
import WitnessSection from '@/components/WitnessSection';
import { ChevronRight, Search, FileText, CheckCircle2, XCircle, Loader2, Trophy, BookOpen, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CaseData {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  setting: string;
  language_code: string;
  evidence: Array<{ tab_name: string; content: string }>;
  witness: {
    witness_name: string;
    question_1_target: string;
    question_1_native: string;
    reply_1_target: string;
    question_2_target: string;
    question_2_native: string;
    reply_2_target: string;
    question_3_target: string;
    question_3_native: string;
    reply_3_target: string;
  };
  deductions: Array<{ option_text: string; is_correct: boolean }>;
}

export default function CasePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDeduction, setSelectedDeduction] = useState<number | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [sessionWords, setSessionWords] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function fetchCaseData() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch Case
        const { data: caseInfo, error: caseError } = await supabase
          .from('cases')
          .select('*')
          .eq('id', id)
          .single();

        if (caseError) throw caseError;
        if (!caseInfo) throw new Error('Case not found');

        // 2. Fetch Evidence
        const { data: evidence, error: evidenceError } = await supabase
          .from('evidence')
          .select('*')
          .eq('case_id', id)
          .order('display_order', { ascending: true });

        if (evidenceError) throw evidenceError;

        // 3. Fetch Witness Interaction
        const { data: witness, error: witnessError } = await supabase
          .from('witness_interactions')
          .select('*')
          .eq('case_id', id)
          .single();

        if (witnessError) throw witnessError;

        // 4. Fetch Deductions
        const { data: deductions, error: deductionsError } = await supabase
          .from('deductions')
          .select('*')
          .eq('case_id', id);

        if (deductionsError) throw deductionsError;

        setCaseData({
          ...caseInfo,
          evidence: evidence || [],
          witness: witness,
          deductions: deductions || []
        });
      } catch (err: any) {
        console.error('Error fetching case data:', err);
        setError(err.message || 'An error occurred while loading the case.');
      } finally {
        setLoading(false);
      }
    }

    fetchCaseData();
  }, [id]);

  const handleWordClick = (word: string, translation: string) => {
    setSessionWords(prev => {
      const next = new Map(prev);
      next.set(word, translation);
      return next;
    });
  };

  const handleDeductionClick = (idx: number) => {
    setSelectedDeduction(idx);
    if (caseData?.deductions[idx].is_correct) {
      setTimeout(() => setShowComplete(true), 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Analyzing the crime scene...</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case Unreachable</h1>
          <p className="text-gray-600 mb-6">{error || 'This case file seems to be missing.'}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Back to Bureau
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Case Complete Overlay */}
      {showComplete && (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-2xl w-full bg-zinc-900 rounded-3xl p-10 shadow-2xl border border-zinc-800 text-center text-white">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Case Solved!</h1>
            <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
              Excellent work, Detective. Your linguistic analysis was critical to closing this investigation.
            </p>

            <div className="bg-zinc-800/50 rounded-2xl p-6 mb-10 border border-zinc-700/50">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Intelligence Gathered ({sessionWords.size} words)
              </h3>
              {sessionWords.size > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from(sessionWords.entries()).map(([word, translation]) => (
                    <div key={word} className="bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <span className="font-bold text-blue-400">{word}</span>
                      <span className="text-zinc-500 text-xs">→</span>
                      <span className="text-zinc-300 text-sm font-medium">{translation}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-600 italic">No new words were logged during this investigation.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/"
                className="bg-white text-zinc-950 py-4 rounded-xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                Return to Bureau
              </Link>
              <Link 
                href="/dictionary"
                className="bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                View Full Dictionary
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Search size={200} />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Case File</span>
              <span className="bg-orange-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{caseData.difficulty}</span>
            </div>
            <Link href="/dictionary" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
              <BookOpen className="w-4 h-4" />
              Dictionary
            </Link>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 font-mono tracking-tight">{caseData.title}</h1>
          <p className="text-slate-300 text-lg max-w-2xl italic">"{caseData.description}"</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
        {/* Evidence Section */}
        {caseData.evidence.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              {caseData.evidence.map((ev, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 px-6 py-4 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTab === idx 
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText size={16} />
                  {ev.tab_name}
                </button>
              ))}
            </div>
            <div className="p-10 min-h-[200px] flex items-center">
              <WordClicker 
                text={caseData.evidence[activeTab]?.content || ''} 
                languageCode={caseData.language_code} 
                onWordClick={handleWordClick}
              />
            </div>
          </div>
        )}

        {/* Interrogation Section */}
        {caseData.witness && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <ChevronRight className="text-blue-600" />
              Interrogation
            </h2>
            <WitnessSection 
              interaction={caseData.witness} 
              languageCode={caseData.language_code} 
              onWordClick={handleWordClick}
            />
          </div>
        )}

        {/* Deduction Section */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl border-4 border-slate-800">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="text-blue-500" />
            Make your deduction:
          </h2>
          <div className="grid gap-4">
            {caseData.deductions.map((deduction, idx) => {
              const isSelected = selectedDeduction === idx;
              const isCorrect = deduction.is_correct;
              
              return (
                <button
                  key={idx}
                  disabled={selectedDeduction !== null}
                  onClick={() => handleDeductionClick(idx)}
                  className={`text-left p-5 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    isSelected
                      ? isCorrect 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-red-500 bg-red-500/10'
                      : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                  }`}
                >
                  <div className="mt-1">
                    {isSelected ? (
                      isCorrect ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
                    )}
                  </div>
                  <div className="font-medium text-lg leading-snug">
                    {deduction.option_text}
                  </div>
                </button>
              );
            })}
          </div>
          
          {selectedDeduction !== null && !showComplete && (
            <div className="mt-8 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4">
              {caseData.deductions[selectedDeduction].is_correct ? (
                <div className="text-center">
                  <div className="text-green-400 text-4xl mb-4">Case Solved!</div>
                  <p className="text-slate-400 mb-6">Excellent work, Detective. You've uncovered the truth.</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-red-400 text-2xl mb-2">Wrong Deduction</div>
                  <p className="text-slate-400">Review the evidence and try again.</p>
                  <button 
                    onClick={() => setSelectedDeduction(null)}
                    className="mt-4 text-blue-400 font-bold hover:underline"
                  >
                    Retry Case
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
