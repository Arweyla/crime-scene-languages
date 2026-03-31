'use client';

import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import { translateWord } from '@/app/actions/translate';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WordClickerProps {
  text: string;
  languageCode: string;
  caseId: string;
  onWordClick?: (word: string, translation: string) => void;
}

const normalize = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const dictionaryRaw: Record<string, Record<string, string>> = {
  es: {
    'el': 'the', 'la': 'the', 'los': 'the', 'las': 'the', 'un': 'a', 'una': 'a',
    'en': 'in/on', 'de': 'of/from', 'a': 'to/at', 'con': 'with', 'por': 'for/by', 'para': 'for',
    'y': 'and', 'o': 'or', 'pero': 'but', 'que': 'that', 'es': 'is', 'está': 'is', 'esta': 'this',
    'estás': 'are (you)', 'estas': 'are (you)', 'esto': 'this', 'ese': 'that', 'esa': 'that',
    'no': 'no/not', 'sí': 'yes', 'muy': 'very', 'mucho': 'a lot', 'poco': 'a little',
    'mi': 'my', 'tu': 'your', 'su': 'his/her/their', 'me': 'me', 'lo': 'it',
    'dónde': 'where', 'qué': 'what/why', 'cómo': 'how', 'quién': 'who', 'cuándo': 'when',
    'cuánto': 'how much', 'más': 'more', 'menos': 'less', 'bien': 'well/fine',
    'nada': 'nothing', 'todo': 'everything', 'alguien': 'someone', 'nadie': 'nobody',
    'hasta': 'until', 'después': 'after', 'sin': 'without', 'del': 'of the', 'al': 'to the',
    'solo': 'only', 'tan': 'so', 'como': 'as/like',
    'pedido': 'order', 'cocina': 'kitchen', 'cocinero': 'cook', 'tiene': 'has', 
    'veinte': 'twenty', 'minutos': 'minutes', 'siento': 'feel (am sorry)', 
    'mesa': 'table', 'problema': 'problem', 'desayuno': 'breakfast', 
    'llevo': 'I have been', 'esperando': 'waiting', 'cliente': 'customer', 
    'impaciente': 'impatient', 'café': 'coffee', 'tostada': 'toast', 
    'zumo': 'juice', 'naranja': 'orange', 'total': 'total', 'hay': 'there is',
    'nota': 'note', 'camarero': 'waiter',
    'hola': 'hello', 'ana': 'Ana', 'puerta': 'door', 'abierta': 'open',
    'copia': 'copy', 'llave': 'key', 'martes': 'Tuesday',
    'casa': 'home', 'busco': 'I look for', 'viste': 'did you see',
    'pasillo': 'hallway', 'hombre': 'man', 'joven': 'young', 'conozco': 'I know',
    'hora': 'hour/time', 'seis': 'six', 'tarde': 'afternoon/evening',
    'normal': 'normal', 'ordenada': 'tidy/organized', 'vecina': 'neighbor',
    'restaurante': 'restaurant', 'propietario': 'owner', 'llegó': 'arrived', 
    'noche': 'night', 'sabe': 'knows', 'escucha': 'listen', 'necesito': 'I need', 
    'hablar': 'to speak', 'contigo': 'with you', 'vengas': 'come', 'mañana': 'tomorrow', 
    'cerrado': 'closed', 'estará': 'will be', 'llegamos': 'we arrived', 
    '9': '9', 'explicación': 'explanation', 'vergüenza': 'shame',
    'cena': 'dinner', 'dos': 'two', 'vino': 'wine', 'tinto': 'red',
    'trabajaste': 'did you work', 'diez': 'ten', 'jefe': 'boss', 'dijo': 'said', 
    'fuera': 'go/leave', 'había': 'there were', 'clientes': 'customers', 
    'cuando': 'when', 'cerraste': 'you closed', 'pareja': 'couple', 
    'fondo': 'back', 'conocía': 'I knew', 'nervioso': 'nervous', 
    'recibió': 'he/she received', 'llamada': 'call', 'cambió': 'changed',
    'estaba': 'was', 'buzón': 'mailbox/voicemail'
  }
};

const normalizedDictionary: Record<string, Record<string, string>> = {};
Object.keys(dictionaryRaw).forEach(lang => {
  normalizedDictionary[lang] = {};
  Object.entries(dictionaryRaw[lang]).forEach(([word, translation]) => {
    normalizedDictionary[lang][normalize(word)] = translation;
  });
});

const getLocalTranslation = (word: string, lang: string): string | null => {
  const cleanWord = word.replace(/[¿?¡!.,:;()\[\]{}—\-_€]/g, '').trim();
  if (!cleanWord) return null;
  if (/^\d+$/.test(cleanWord)) return cleanWord;
  const langDict = dictionaryRaw[lang];
  const langNormDict = normalizedDictionary[lang];
  if (!langDict || !langNormDict) return null;
  return langDict[cleanWord] || langDict[cleanWord.toLowerCase()] || langNormDict[normalize(cleanWord)] || null;
};

export default function WordClicker({ text, languageCode, caseId, onWordClick }: WordClickerProps) {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [sessionTranslations, setSessionTranslations] = useState<Record<string, string>>({});
  const [loadingWords, setLoadingWords] = useState<Record<number, boolean>>({});
  const { user } = useAuth();

  const words = text.split(/\s+/).filter(w => w.length > 0);

  const handleWordClick = async (index: number, word: string) => {
    const isActive = activeWordIndex === index;
    setActiveWordIndex(isActive ? null : index);

    if (!isActive) {
      const cleanWord = word.replace(/[¿?¡!.,:;()\[\]{}—\-_€]/g, '').trim();
      const lowerWord = cleanWord.toLowerCase();
      
      let translation = getLocalTranslation(cleanWord, languageCode) || sessionTranslations[lowerWord];

      if (!translation && user) {
        setLoadingWords(prev => ({ ...prev, [index]: true }));
        try {
          console.log(`[Fetch] Checking learned_words for: ${cleanWord}`);
          const { data } = await supabase
            .from('learned_words')
            .select('translation')
            .eq('user_id', user.id)
            .eq('word', cleanWord)
            .single();

          if (data?.translation) {
            translation = data.translation;
            setSessionTranslations(prev => ({ ...prev, [lowerWord]: translation! }));
          }
        } catch (err) {
          console.error('[Error] DB fetch:', err);
        } finally {
          setLoadingWords(prev => ({ ...prev, [index]: false }));
        }
      }

      if (!translation) {
        setLoadingWords(prev => ({ ...prev, [index]: true }));
        try {
          const apiResult = await translateWord(cleanWord, languageCode);
          if (apiResult) {
            translation = apiResult;
            setSessionTranslations(prev => ({ ...prev, [lowerWord]: apiResult }));
          }
        } catch (err) {
          console.error('[Error] Translation:', err);
        } finally {
          setLoadingWords(prev => ({ ...prev, [index]: false }));
        }
      }

      if (translation && translation !== '...') {
        if (onWordClick) onWordClick(cleanWord, translation);

        if (user) {
          try {
            console.log(`[Save] Upserting to learned_words: ${cleanWord} (${translation}) for case ${caseId}`);
            await supabase
              .from('learned_words')
              .upsert({
                user_id: user.id,
                word: cleanWord,
                translation: translation,
                case_id: caseId
              }, {
                onConflict: 'user_id,word'
              });
          } catch (err) {
            console.error('[Error] Save learned_word:', err);
          }
        }
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-3 leading-relaxed text-xl font-medium">
      {words.map((word, index) => {
        const cleanWord = word.replace(/[¿?¡!.,:;()\[\]{}—\-_€]/g, '').trim().toLowerCase();
        const translation = getLocalTranslation(word, languageCode) || sessionTranslations[cleanWord] || '...';
        const isActive = activeWordIndex === index;
        const isLoading = loadingWords[index];

        return (
          <div key={index} className="relative inline-block">
            <button
              onClick={() => handleWordClick(index, word)}
              className={cn(
                "px-1.5 py-0.5 rounded-lg transition-all duration-300 cursor-help border border-transparent",
                "hover:border-neon-blue/30 hover:bg-neon-blue/5 hover:text-neon-blue hover:shadow-[0_0_15px_rgba(0,242,255,0.1)]",
                isActive && "bg-neon-blue/20 border-neon-blue/50 text-neon-blue shadow-[0_0_20px_rgba(0,242,255,0.2)] scale-110 z-10"
              )}
            >
              {word}
            </button>
            {isActive && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-zinc-900 border border-neon-blue/50 text-white text-sm rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,242,255,0.1)] z-50 flex items-center gap-3 whitespace-nowrap animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300 backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neon-blue opacity-70 mb-0.5">Translation</span>
                  <span className="font-bold tracking-wide">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-neon-blue" /> : translation}
                  </span>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-neon-blue/50" />
                <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-zinc-900" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
