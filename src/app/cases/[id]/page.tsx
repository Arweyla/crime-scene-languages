'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import WordClicker from '@/components/WordClicker';
import WitnessSection from '@/components/WitnessSection';
import { ChevronRight, Search, FileText, CheckCircle2, XCircle, Loader2, Trophy, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

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

const tabTranslations: Record<string, string> = {
  'Mensaje': 'Message', 'Recibo': 'Receipt', 'Diario': 'Diary',
  'Nota': 'Note', 'Buzón': 'Voicemail', 'Reseña': 'Review'
};

export default function CasePage() {
  const { id } = useParams();
  const caseId = id as string;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDeduction, setSelectedDeduction] = useState<number | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [learnedWordsCount, setLearnedWordsCount] = useState(0);
  const [finalWords, setFinalWords] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCaseData() {
      if (!caseId) return;
      try {
        setLoading(true);
        const { data: caseInfo } = await supabase.from('cases').select('*').eq('id', caseId).single();
        if (!caseInfo) throw new Error('Case not found');
        const { data: evidence } = await supabase.from('evidence').select('*').eq('case_id', caseId).order('display_order', { ascending: true });
        const { data: witness } = await supabase.from('witness_interactions').select('*').eq('case_id', caseId).single();
        const { data: deductions } = await supabase.from('deductions').select('*').eq('case_id', caseId);
        setCaseData({ ...caseInfo, evidence: evidence || [], witness: witness, deductions: deductions || [] });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCaseData();
  }, [caseId]);

  const handleDeductionClick = async (idx: number) => {
    setSelectedDeduction(idx);
    if (caseData?.deductions[idx].is_correct) {
      if (user) {
        console.log(`[Fetch] Summary words for user ${user.id} and case ${caseId}`);
        const { data } = await supabase
          .from('learned_words')
          .select('word, translation')
          .eq('user_id', user.id)
          .eq('case_id', caseId);
        
        setFinalWords(data || []);
        setLearnedWordsCount(data?.length || 0);
      }
      setTimeout(() => setShowComplete(true), 1500);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-neon-blue">
      <div className="relative">
        <Loader2 className="w-16 h-16 animate-spin opacity-50" />
        <div className="absolute inset-0 blur-xl bg-neon-blue/20 animate-pulse" />
      </div>
      <p className="mt-6 font-black uppercase tracking-[0.3em] text-xs">Retrieving Evidence Files...</p>
    </div>
  );

  if (error || !caseData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-case-red p-6 text-center">
      <XCircle className="w-12 h-12 mb-4" />
      <h2 className="text-2xl font-black uppercase tracking-tight">Database Error</h2>
      <p className="text-zinc-500 mt-2 max-w-md">{error || 'Case file corrupted or not found.'}</p>
      <Link href="/" className="mt-8 bg-zinc-900 border border-white/10 px-6 py-2 rounded-xl text-white font-bold hover:bg-zinc-800 transition-all">
        Return to Bureau
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 bg-mesh-noir scanline relative overflow-hidden pb-32">
      {showComplete && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-neon-blue/10 blur-[120px] rounded-full" />
          </div>
          
          <div className="max-w-3xl w-full relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-zinc-900 border border-case-green/50 shadow-[0_0_50px_rgba(59,255,122,0.2)] mb-8 animate-float">
                <Trophy className="w-12 h-12 text-case-green" />
              </div>
              
              <h1 className="text-6xl font-black uppercase tracking-tightest mb-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                Case Closed
              </h1>
              <p className="text-neon-blue font-black uppercase tracking-[0.4em] text-sm mb-12">Intelligence Assessment: SUCCESSFUL</p>
              
              <div className="bg-zinc-900/50 rounded-[40px] p-10 mb-12 border border-white/5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-case-green to-transparent opacity-50" />
                
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center justify-center gap-3">
                  <BookOpen className="w-4 h-4 text-neon-yellow" />
                  Vocabulary Intel Acquired
                </h3>
                
                {finalWords.length > 0 ? (
                  <div className="flex flex-wrap gap-3 justify-center max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                    {finalWords.map((w, i) => (
                      <div key={i} className="bg-zinc-950/80 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 transition-all hover:border-neon-blue/30 group">
                        <span className="font-black text-white group-hover:text-neon-blue transition-colors">{w.word}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-zinc-400 text-sm font-medium">{w.translation}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-zinc-600 italic font-medium">
                    No linguistic data was recorded during this operation.
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link 
                  href="/" 
                  className="bg-zinc-900 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95"
                >
                  Bureau Mainframe
                </Link>
                <Link 
                  href="/dictionary" 
                  className="bg-white text-zinc-950 py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-neon-blue hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                >
                  Full Archives
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Nav / Back */}
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-neon-blue transition-colors text-xs font-black uppercase tracking-[0.2em] group"
        >
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-neon-blue/30 group-hover:bg-neon-blue/5 transition-all">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </div>
          Abort Investigation
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="relative mb-16">
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_15px_rgba(0,242,255,0.5)]" />
          <h1 className="text-6xl font-black uppercase tracking-tightest mb-4 leading-none">{caseData.title}</h1>
          <div className="flex items-center gap-6">
            <p className="text-zinc-400 text-xl font-medium max-w-2xl leading-relaxed italic">"{caseData.description}"</p>
            <div className="hidden md:block h-px flex-1 bg-white/5" />
            <div className="px-4 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">
              STATION: {caseData.setting}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Investigation Area */}
          <div className="lg:col-span-2 space-y-12">
            {caseData.evidence.length > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-6 bg-neon-blue rounded-full" />
                  <h2 className="text-xl font-black uppercase tracking-tight">Evidence Dossier</h2>
                </div>
                
                <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-md">
                  <div className="flex bg-zinc-950/50 p-3 gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
                    {caseData.evidence.map((ev, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveTab(idx)} 
                        className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                          activeTab === idx 
                          ? 'bg-zinc-800 text-white border border-white/10 shadow-lg' 
                          : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {tabTranslations[ev.tab_name] || ev.tab_name}
                      </button>
                    ))}
                  </div>
                  <div className="p-12 min-h-[300px] flex items-start relative group">
                    <div className="absolute top-6 right-8 text-[8px] font-black text-zinc-800 tracking-[0.4em] uppercase pointer-events-none">
                      DECRYPTED_SEGMENT_{activeTab + 1}
                    </div>
                    <WordClicker 
                      text={caseData.evidence[activeTab]?.content || ''} 
                      languageCode={caseData.language_code} 
                      caseId={caseId} 
                    />
                  </div>
                </div>
              </section>
            )}

            {caseData.witness && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                <WitnessSection 
                  interaction={caseData.witness} 
                  languageCode={caseData.language_code} 
                  caseId={caseId} 
                />
              </section>
            )}
          </div>

          {/* Sidebar - Deductions */}
          <div className="space-y-8">
            <section className="sticky top-12 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
              <div className="bg-zinc-900 border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                {/* Scanner effect line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-pink/30 animate-scanline pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-neon-pink/30 flex items-center justify-center">
                    <Search className="text-neon-pink w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Final Deduction</h2>
                </div>
                
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 leading-relaxed">
                  Analyze all collected intelligence. Once you submit, the case file will be sealed.
                </p>

                <div className="space-y-4">
                  {caseData.deductions.map((deduction, idx) => {
                    const isSelected = selectedDeduction === idx;
                    const isCorrect = deduction.is_correct;
                    
                    return (
                      <button 
                        key={idx} 
                        disabled={selectedDeduction !== null} 
                        onClick={() => handleDeductionClick(idx)} 
                        className={`w-full text-left p-6 rounded-[24px] border-2 transition-all duration-300 relative group overflow-hidden ${
                          selectedDeduction === idx 
                          ? (isCorrect 
                            ? 'border-case-green bg-case-green/10 shadow-[0_0_30px_rgba(59,255,122,0.1)]' 
                            : 'border-case-red bg-case-red/10 shadow-[0_0_30px_rgba(255,59,59,0.1)]'
                          ) 
                          : 'border-white/5 bg-zinc-950/50 hover:border-white/20 hover:bg-zinc-950'
                        }`}
                      >
                        {isSelected && (
                          <div className={`absolute top-4 right-4 ${isCorrect ? 'text-case-green' : 'text-case-red'}`}>
                            {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                        )}
                        <p className={`font-bold leading-tight ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                          {deduction.option_text}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {selectedDeduction !== null && !caseData.deductions[selectedDeduction].is_correct && (
                  <button 
                    onClick={() => setSelectedDeduction(null)}
                    className="w-full mt-6 py-4 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Re-evaluate Evidence
                  </button>
                )}
              </div>
              
              <div className="mt-8 p-6 bg-zinc-900/40 border border-white/5 rounded-[32px] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="w-4 h-4 text-neon-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">L.I.B. Field Agent Note</span>
                </div>
                <p className="text-zinc-500 text-[10px] leading-relaxed uppercase font-bold tracking-wider">
                  Click on words in the evidence or witness statements to log them in your dictionary. 
                  Linguistic mastery is 90% of the investigation.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
