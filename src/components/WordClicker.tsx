'use client';

import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WordClickerProps {
  text: string;
  languageCode: string;
  onWordClick?: (word: string, translation: string) => void;
}

// Mock dictionary for now
const dictionary: Record<string, Record<string, string>> = {
  es: {
    'El': 'The', 'pedido': 'order', 'está': 'is', 'en': 'in', 'la': 'the', 
    'cocina': 'kitchen', 'cocinero': 'cook', 'lo': 'it', 'tiene': 'has', 
    'Veinte': 'Twenty', 'minutos': 'minutes', 'Lo': 'I', 'siento': 'am sorry', 
    'mucho': 'very much', 'No': 'No', 'mesa': 'table', 'bien': 'well/fine', 
    'problema': 'problem', '¿Dónde': 'Where', 'mi': 'my', 'desayuno': 'breakfast', 
    'Llevo': 'I have been', 'esperando': 'waiting', 'cliente': 'customer', 
    'muy': 'very', 'impaciente': 'impatient', 'Pedido': 'Order', 'Café': 'Coffee', 
    'Tostada': 'Toast', 'Zumo': 'Juice', 'de': 'of', 'naranja': 'orange', 
    'Total': 'Total', 'Mesa': 'Table', 'hay': 'there is', 'un': 'a', 'con': 'with'
  }
};

const getTranslation = (word: string, lang: string): string => {
  const cleanWord = word.replace(/[¿?¡!.,]/g, '');
  return dictionary[lang]?.[cleanWord] || dictionary[lang]?.[cleanWord.toLowerCase()] || '...';
};

export default function WordClicker({ text, languageCode, onWordClick }: WordClickerProps) {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const { user } = useAuth();

  const words = text.split(' ');

  const handleWordClick = async (index: number, word: string) => {
    const isActive = activeWordIndex === index;
    setActiveWordIndex(isActive ? null : index);

    if (!isActive) {
      const cleanWord = word.replace(/[¿?¡!.,]/g, '');
      const translation = getTranslation(word, languageCode);
      
      // Track session words
      if (onWordClick) {
        onWordClick(cleanWord, translation);
      }

      if (user) {
        try {
          // Increment click count if exists, otherwise insert
          const { error } = await supabase.rpc('upsert_word_encounter', {
            p_user_id: user.id,
            p_word: cleanWord,
            p_translation: translation,
            p_lang: languageCode
          });

          // Fallback if RPC doesn't exist yet (standard upsert)
          if (error) {
            await supabase
              .from('word_encounters')
              .upsert({
                user_id: user.id,
                word_target: cleanWord,
                translation_native: translation,
                language_code: languageCode,
                last_seen: new Date().toISOString()
              }, {
                onConflict: 'user_id,word_target,language_code'
              });
          }
        } catch (err) {
          console.error('Error saving word encounter:', err);
        }
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-2 leading-relaxed text-lg">
      {words.map((word, index) => {
        const translation = getTranslation(word, languageCode);
        const isActive = activeWordIndex === index;

        return (
          <div key={index} className="relative inline-block">
            <button
              onClick={() => handleWordClick(index, word)}
              className={cn(
                "px-0.5 rounded transition-colors cursor-help border-b-2 border-transparent hover:border-blue-400 hover:bg-blue-50",
                isActive && "bg-blue-100 border-blue-500"
              )}
            >
              {word}
            </button>
            
            {isActive && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded shadow-lg z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                {translation}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
