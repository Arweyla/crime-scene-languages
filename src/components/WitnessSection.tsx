'use client';

import React, { useState } from 'react';
import WordClicker from './WordClicker';

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
  onWordClick?: (word: string, translation: string) => void;
}

export default function WitnessSection({ interaction, languageCode, onWordClick }: WitnessSectionProps) {
  const [activeReply, setActiveReply] = useState<string | null>(null);

  const questions = [
    { target: interaction.question_1_target, native: interaction.question_1_native, reply: interaction.reply_1_target },
    { target: interaction.question_2_target, native: interaction.question_2_native, reply: interaction.reply_2_target },
    { target: interaction.question_3_target, native: interaction.question_3_native, reply: interaction.reply_3_target },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {interaction.witness_name[0]}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{interaction.witness_name}</h3>
          <p className="text-sm text-gray-500">Witness</p>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4 mb-8">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ask a question:</p>
          <div className="grid gap-3">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReply(q.reply)}
                className="text-left p-4 rounded-lg border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="font-medium text-blue-900 group-hover:text-blue-600">{q.target}</div>
                <div className="text-sm text-gray-500 italic">{q.native}</div>
              </button>
            ))}
          </div>
        </div>

        {activeReply && (
          <div className="animate-in fade-in slide-in-from-top-4">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Witness reply:</p>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <WordClicker text={activeReply} languageCode={languageCode} onWordClick={onWordClick} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
