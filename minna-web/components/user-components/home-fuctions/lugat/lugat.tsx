"use client"; // <-- MANA SHU QATOR JUDAYAM MUHIM, TUSHIB QOLMASIN!

import React, { useState, useEffect } from 'react';
import { Word, MOCK_WORDS } from '../../../../app/constants/dictionary-data';
import { Search, Volume2, BookOpen, Layers, Plus, X, Pencil, Trash2 } from 'lucide-react';
import Kartochkalar from './Kartochkalar';

export default function Lugat() {
  const [activeTab, setActiveTab] = useState<"lugat" | "kartalar">("lugat");
  const [searchQuery, setSearchQuery] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Karta o'qish rejimiga o'tilganda tepa qismlarni yashirish uchun state
  const [isPracticing, setIsPracticing] = useState(false);

  // Modal uchun statelar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newKanji, setNewKanji] = useState("");
  const [newKana, setNewKana] = useState("");
  const [newUzbek, setNewUzbek] = useState("");

  useEffect(() => {
    const fetchDictionaryData = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          setWords(MOCK_WORDS);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Ma'lumotni yuklashda xatolik:", error);
        setIsLoading(false);
      }
    };
    fetchDictionaryData();
  }, []);

  const filteredWords = words.filter(word => 
    word.kanji.includes(searchQuery) || 
    (word.kana && word.kana.includes(searchQuery)) ||
    (word.romaji && word.romaji.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (word.uzbek && word.uzbek.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingId(null);
    setNewKanji("");
    setNewKana("");
    setNewUzbek("");
    setIsModalOpen(true);
  };

  const openEditModal = (word: Word) => {
    setEditingId(word.id);
    setNewKanji(word.kanji);
    setNewKana(word.kana || word.romaji || "");
    setNewUzbek(word.uzbek);
    setIsModalOpen(true);
  };

  const handleDeleteKanji = (id: number) => {
    if (window.confirm("Rostdan ham bu so'zni o'chirib tashlamoqchimisiz?")) {
      setWords(words.filter(w => w.id !== id));
    }
  };

  const handleSaveKanji = () => {
    if (!newKanji || !newUzbek) return;

    if (editingId) {
      setWords(words.map(w => 
        w.id === editingId ? { ...w, kanji: newKanji, kana: newKana, romaji: newKana, uzbek: newUzbek } : w
      ));
    } else {
      const newWord: Word = {
        id: Date.now(),
        kanji: newKanji,
        kana: newKana,
        romaji: newKana,
        uzbek: newUzbek,
        level: "N5"
      };
      setWords([newWord, ...words]);
    }
    
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium">Lug'at yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* ================= TABS VA QO'SHIMCHA TUGMALAR (Faqat mashq bo'lmayotganda ko'rinadi) ================= */}
      {!isPracticing && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-[14px] w-full sm:w-auto shrink-0">
            <button 
              onClick={() => setActiveTab("lugat")}
              className={`flex-1 sm:flex-none py-2.5 px-5 sm:px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "lugat" ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Lug'at
            </button>
            <button 
              onClick={() => setActiveTab("kartalar")}
              className={`flex-1 sm:flex-none py-2.5 px-5 sm:px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === "kartalar" ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" /> Kartochkalar
            </button>
          </div>

          {activeTab === "lugat" && (
            <div className="relative group w-full flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Yaponcha, Romaji yoki O'zbekcha yozing..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-gray-800 rounded-[14px] outline-none transition-all text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" 
              />
            </div>
          )}

          {activeTab === "kartalar" && (
            <div className="w-full sm:w-auto flex-1 flex justify-end">
              <button 
                onClick={openAddModal}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[14px] font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Yangi qo'shish
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= LUG'AT RO'YXATI ================= */}
      {activeTab === "lugat" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => (
              <div 
                key={word.id} 
                className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 transition-all group"
              >
                <button className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shrink-0 border border-gray-100 dark:border-gray-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-500/30">
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {word.kanji}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-indigo-500 dark:text-indigo-400 truncate">
                      {word.kana || word.romaji}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate w-full">
                    {word.uzbek}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEditModal(word)}
                    className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteKanji(word.id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredWords.length === 0 && (
            <div className="w-full text-center py-16 text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Bunday so'z topilmadi...</p>
            </div>
          )}
        </div>
      )}

      {/* ================= KARTOCHKALAR ================= */}
      {activeTab === "kartalar" && (
        <Kartochkalar 
          words={words} 
          onPracticeStateChange={setIsPracticing} 
        /> 
      )}

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? "Kanji'ni Tahrirlash" : "Yangi Kanji Qo'shish"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kanji</label>
                <input 
                  type="text" 
                  placeholder="Masalan: 水" 
                  value={newKanji}
                  onChange={(e) => setNewKanji(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-colors dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">O'qilishi (Kana/Romaji)</label>
                <input 
                  type="text" 
                  placeholder="Masalan: mizu" 
                  value={newKana}
                  onChange={(e) => setNewKana(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-colors dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">O'zbekcha tarjimasi</label>
                <input 
                  type="text" 
                  placeholder="Masalan: Suv" 
                  value={newUzbek}
                  onChange={(e) => setNewUzbek(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-colors dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-5 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleSaveKanji}
                disabled={!newKanji || !newUzbek} 
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Saqlash
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}