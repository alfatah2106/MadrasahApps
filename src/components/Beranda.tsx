import React from 'react';
import { Home, ChevronRight } from 'lucide-react';

export default function Beranda({ setTab }: { setTab: (tab: string) => void }) {
  return (
    <div className="p-6 md:p-10 h-full flex flex-col justify-center items-center text-center">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-inner">
        <Home size={40} className="md:w-12 md:h-12 text-blue-600" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 tracking-tight">Selamat Datang di Madrasah App</h2>
      <p className="text-base md:text-lg text-gray-500 mb-8 md:mb-10 max-w-xl leading-relaxed">
        Platform pembelajaran digital terpadu. Akses materi, kumpulkan tugas, dan berdiskusi dengan asisten AI dalam satu tempat yang aman dan nyaman.
      </p>
      <button 
        onClick={() => setTab('perpustakaan')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-md transition-transform active:scale-95 flex items-center gap-2"
      >
        Mulai Belajar <ChevronRight size={24} />
      </button>
    </div>
  );
}
