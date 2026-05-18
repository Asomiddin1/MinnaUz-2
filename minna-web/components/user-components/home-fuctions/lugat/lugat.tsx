"use client";

import React, { useState, useEffect } from 'react';
import { Word, Deck, MOCK_WORDS, MOCK_DECKS, MOCK_WORD_OF_THE_DAY } from '../../../../app/constants/dictionary-data';
import { 
  Search, Plus, Volume2, BookOpen, Layers, Star, 
  MoreVertical, Play, ArrowLeft, RotateCw, ChevronRight, ChevronLeft, Loader2, Sparkles, Image as ImageIcon, Flame, Brain, Check
} from 'lucide-react';

export default function Lugat() {
  const [activeTab, setActiveTab] = useState<"lugat" | "kartalar" | "mashq">("lugat");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [words, setWords] = useState<Word[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<Word | null>(null);

  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Saqlanganligini bildirish uchun (animatsiya)
  const [addedWords, setAddedWords] = useState<number[]>([]);

  useEffect(() => {
    const fetchDictionaryData = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          setWords(MOCK_WORDS);
          setWordOfTheDay(MOCK_WORD_OF_THE_DAY);
          setDecks(MOCK_DECKS);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Xatolik:", error);
        setIsLoading(false);
      }
    };
    fetchDictionaryData();
  }, []);

  const filteredWords = words.filter(word => 
    word.kanji.includes(searchQuery) || 
    word.romaji.toLowerCase().includes(searchQuery.toLowerCase()) || 
    word.uzbek.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startPractice = (deck: Deck) => {
    if(deck.words.length === 0) {
      alert("Bu to'plamda hozircha so'z yo'q. Avval lug'atdan so'z qo'shing!");
      return;
    }
    setActiveDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setActiveTab("mashq");
  };

  const nextCard = () => {
    if (activeDeck && currentCardIndex < activeDeck.words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
    }
  };

  const handleAddToDeck = (word: Word) => {
    setDecks(prevDecks => {
      const updatedDecks = [...prevDecks];
      const targetDeckIndex = updatedDecks.findIndex(d => d.category === word.category);

      if (targetDeckIndex !== -1) {
        const isAlreadyAdded = updatedDecks[targetDeckIndex].words.some(w => w.id === word.id);
        
        if (!isAlreadyAdded) {
          updatedDecks[targetDeckIndex].words.push(word);
          updatedDecks[targetDeckIndex].count += 1;
          
          setAddedWords(prev => [...prev, word.id]);
          alert(`✅ So'z muvaffaqiyatli "${updatedDecks[targetDeckIndex].title}" guruhiga saqlandi!`);
        } else {
          alert(`⚠️ Bu so'z allaqachon to'plamda bor!`);
        }
      }
      return updatedDecks;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "mashq") return;
      if (e.key === "ArrowRight") nextCard();
      else if (e.key === "ArrowLeft") prevCard();
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault(); 
        setIsFlipped(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, currentCardIndex, activeDeck]);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextCard();
    else if (distance < -minSwipeDistance) prevCard();
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-4 border-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-gray-500 font-medium tracking-wide">Lug'at tayyorlanmoqda...</p>
      </div>
    );
  }

  // ========================================================
  // MASHQ REJIMI (RESPONSIVE TO'G'IRLANDI)
  // ========================================================
  if (activeTab === "mashq" && activeDeck) {
    const currentWord = activeDeck.words[currentCardIndex];
    return (
      <div className="w-full max-w-[900px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header qismi - kichik ekranda stack bo'ladi */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <button onClick={() => setActiveTab("kartalar")} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors bg-white dark:bg-slate-800 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Orqaga
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
             <span className={`text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border ${activeDeck.category === "Asosiy" ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800" : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800"}`}>
               {activeDeck.category}
             </span>
            <div className="bg-white dark:bg-slate-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              {currentCardIndex + 1} <span className="text-gray-400">/ {activeDeck.words.length}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 sm:h-2 mb-4 sm:mb-6 overflow-hidden">
          <div className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${activeDeck.category === "Asosiy" ? "bg-blue-500" : "bg-rose-500"}`} style={{ width: `${((currentCardIndex + 1) / activeDeck.words.length) * 100}%` }}></div>
        </div>

        {/* Karta va strelkalar - mobil uchun optimallashtirildi */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6 w-full">
          {/* Chap strelka - kichik ekranda kichikroq */}
          <button onClick={prevCard} disabled={currentCardIndex === 0} className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
          </button>

          {/* Karta - balandligi moslashuvchan */}
          <div className="flex-1 relative h-[320px] sm:h-[380px] md:h-[480px] lg:h-[500px] cursor-pointer group perspective-1000" onClick={() => setIsFlipped(!isFlipped)} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndEvent}>
            <div className={`relative w-full h-full transition-transform duration-700 ease-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* Old tomon */}
              <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-[#151822] border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-[2rem] flex flex-col overflow-hidden">
                {currentWord?.image && (
                  <div className="relative w-full h-[40%] sm:h-[45%] shrink-0">
                    <img src={currentWord.image} className="w-full h-full object-cover" alt={currentWord.kanji} />
                    <div className="absolute bottom-0 w-full h-16 sm:h-24 bg-gradient-to-t from-white dark:from-[#151822] to-transparent"></div>
                  </div>
                )}
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{currentWord?.kanji}</h2>
                  <p className="text-lg sm:text-xl md:text-2xl text-blue-600 dark:text-blue-400 font-medium">{currentWord?.kana}</p>
                </div>
                <div className="pb-4 sm:pb-6 pt-1 sm:pt-2 flex justify-center shrink-0">
                  <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium flex items-center gap-1.5 sm:gap-2">
                    <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                    <span className="hidden sm:inline">Bosing yoki Space</span>
                    <span className="sm:hidden">Bosish</span>
                  </span>
                </div>
              </div>

              {/* Orqa tomon */}
              <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-[#151822] border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-[2rem] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
                 <div className="w-full flex justify-end"><RotateCw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" /></div>
                 <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                   <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 text-center px-2">{currentWord?.uzbek}</h2>
                   <p className="text-base sm:text-lg md:text-xl text-indigo-600 dark:text-indigo-400 font-mono bg-gray-50 dark:bg-slate-800 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl border border-gray-200 dark:border-gray-700">{currentWord?.romaji}</p>
                 </div>
                 <div className="pb-2 pt-1 sm:pt-2 flex justify-center shrink-0">
                  <span className="bg-gray-100 dark:bg-slate-800 text-gray-500 text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium flex items-center gap-1.5 sm:gap-2">
                    <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> 
                    <span className="hidden sm:inline">Bosing yoki Space</span>
                    <span className="sm:hidden">Bosish</span>
                  </span>
                </div>
              </div>
              
            </div>
          </div>

          {/* O'ng strelka - kichik ekranda kichikroq */}
          <button onClick={nextCard} disabled={currentCardIndex === activeDeck.words.length - 1} className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7" />
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // ASOSIY SAHIFA (RESPONSIVE TO'G'IRLANDI)
  // ========================================================
  return (
    <div className="w-full max-w-[900px] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Tab navigatsiya - kichik ekranda stack bo'ladi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-4 sm:mb-6">
        <button 
          onClick={() => setActiveTab("lugat")}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${
            activeTab === "lugat" 
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Lug'at
        </button>
        <button 
          onClick={() => setActiveTab("kartalar")}
          className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center justify-center ${
            activeTab === "kartalar" 
              ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm" 
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Kartochkalar
        </button>
      </div>

      {/* Kun so'zi - kichik ekranda stack */}
      {wordOfTheDay && activeTab === "lugat" && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase">Kun so'zi</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{wordOfTheDay.kanji}</h3>
              <p className="text-base sm:text-lg text-blue-600 dark:text-blue-400">{wordOfTheDay.kana}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">{wordOfTheDay.uzbek}</p>
            </div>
            {wordOfTheDay.image && (
              <img src={wordOfTheDay.image} alt={wordOfTheDay.kanji} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover" />
            )}
          </div>
        </div>
      )}

      {/* Lug'at qidiruv va ro'yxat */}
      {activeTab === "lugat" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 sm:pl-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Yaponcha, Romaji yoki O'zbekcha yozing..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3.5 sm:py-5 bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl outline-none transition-all text-base sm:text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500" 
            />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Ro'yxat</h2>
            {/* Grid - mobil uchun 1 ustun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredWords.map((word) => {
                const isAdded = addedWords.includes(word.id);
                return (
                <div key={word.id} className="bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 p-3 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center justify-between hover:-translate-y-1 transition-transform group gap-2 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    {word.image ? (
                       <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                         <img src={word.image} className="w-full h-full object-cover" alt={word.kanji} />
                       </div>
                    ) : (
                      <button className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors shrink-0 border border-gray-200 dark:border-gray-700">
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">{word.kanji}</h3>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">{word.kana}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 truncate">{word.uzbek}</p>
                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border shrink-0 ${word.category === "Asosiy" ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800" : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800"}`}>
                          {word.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Qo'shish tugmasi */}
                  <button 
                    onClick={() => handleAddToDeck(word)}
                    disabled={isAdded}
                    className={`flex flex-col items-center justify-center transition-colors shrink-0 ${isAdded ? 'text-green-500 cursor-default' : 'text-gray-400 hover:text-blue-600'}`}
                    title={isAdded ? "Saqlangan" : `"${word.category}" to'plamiga qo'shish`}
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border mb-0.5 sm:mb-1 transition-all ${isAdded ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-50 dark:bg-[#252a38] border-gray-200 dark:border-gray-700'}`}>
                      {isAdded ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-center leading-tight">
                      {isAdded ? "Saqlandi" : "Qo'shish"}
                    </span>
                  </button>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* ======================= TO'PLAMLAR QISMI (RESPONSIVE TO'G'IRLANDI) ======================= */}
      {activeTab === "kartalar" && (
        <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                 <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
               </div>
               <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Asosiy To'plamlar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {decks.filter(d => d.category === "Asosiy").map((deck) => (
                <div key={deck.id} onClick={() => startPractice(deck)} className="relative bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:border-blue-400 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">{deck.title}</h3>
                  <p className="text-xs sm:text-sm font-medium text-blue-500 mb-4 sm:mb-6">{deck.words.length} ta so'z mavjud</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <span>O'zlashtirildi</span><span className="text-gray-900 dark:text-white">{deck.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${deck.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                 <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
               </div>
               <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Murakkab To'plamlar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {decks.filter(d => d.category === "Murakkab").map((deck) => (
                <div key={deck.id} onClick={() => startPractice(deck)} className="relative bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 hover:border-rose-400 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                      <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">{deck.title}</h3>
                  <p className="text-xs sm:text-sm font-medium text-rose-500 mb-4 sm:mb-6">{deck.words.length} ta so'z mavjud</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <span>O'zlashtirildi</span><span className="text-gray-900 dark:text-white">{deck.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${deck.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}