'use client';

import React, { useState } from 'react';
import WordClicker from './WordClicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WitnessInteraction {
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
}

interface WitnessSectionProps {
  interaction: WitnessInteraction;
  languageCode: string;
  caseId: string;
  onWordClick?: (word: string, translation: string) => void;
}

export default function WitnessSection({ interaction, languageCode, caseId, onWordClick }: WitnessSectionProps) {
  const [activeReply, setActiveReply] = useState<string | null>(null);

  const questions = [
    { target: interaction.question_1_target, native: interaction.question_1_native, reply: interaction.reply_1_target },
    { target: interaction.question_2_target, native: interaction.question_2_native, reply: interaction.reply_2_target },
    { target: interaction.question_3_target, native: interaction.question_3_native, reply: interaction.reply_3_target },
  ];

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl relative">
      {/* Decorative pulse element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 rounded-full blur-3xl" />
      
      <div className="bg-zinc-900/80 border-b border-white/5 px-8 py-6 flex items-center gap-5">
        <div className="relative group">
          <div className="w-14 h-14 bg-zinc-950 border border-neon-blue/30 rounded-2xl flex items-center justify-center text-neon-blue font-black text-xl shadow-lg shadow-neon-blue/5 group-hover:neon-border transition-all">
            {interaction.witness_name[0]}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-case-green rounded-full border-2 border-zinc-900 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">{interaction.witness_name}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue opacity-70">Witness Profile #942</p>
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-4 bg-neon-pink rounded-full" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Interrogation Protocol</p>
          </div>
          <div className="grid gap-4">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReply(q.reply)}
                className={cn(
                  "text-left p-5 rounded-2xl border border-white/5 bg-zinc-950/50 transition-all duration-300 group relative overflow-hidden",
                  "hover:border-neon-blue/50 hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(0,242,255,0.05)] hover:-translate-x-1",
                  activeReply === q.reply && "border-neon-blue/40 bg-zinc-900/80 shadow-[0_0_30px_rgba(0,242,255,0.1)] ring-1 ring-neon-blue/20"
                )}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="font-bold text-zinc-100 group-hover:text-neon-blue transition-colors mb-1">{q.target}</div>
                <div className="text-xs text-zinc-500 font-medium italic opacity-60 group-hover:opacity-100 transition-all">{q.native}</div>
              </button>
            ))}
          </div>
        </div>

        {activeReply && (
          <div className="animate-in fade-in slide-in-from-top-6 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-4 bg-neon-blue rounded-full" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Statement Deciphered</p>
            </div>
            <div className="bg-zinc-950/80 p-8 rounded-[24px] border border-neon-blue/20 shadow-inner relative group">
              {/* Corner accents */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neon-blue/30 rounded-tl-sm" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neon-blue/30 rounded-br-sm" />
              
              <div className="relative z-10">
                <WordClicker text={activeReply} languageCode={languageCode} caseId={caseId} onWordClick={onWordClick} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
