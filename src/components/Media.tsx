import React, { useState, useEffect } from 'react';
import { PlayCircle, Video, AlertCircle } from 'lucide-react';

// !!! GANTI LINK INI DENGAN URL WEB APP ISKA TUBE ANDA YANG BARU !!!
const GAS_TUBE_URL = import.meta.env.VITE_GAS_MEDIA_URL || "";

export default function Media() {
  const [mediaList, setMediaList] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(GAS_TUBE_URL, {
          method: "GET",
          redirect: "follow"
        });
        
        if (!response.ok) throw new Error('Gagal terhubung ke server media.');
        
        const textData = await response.text();
        
        try {
          const jsonData = JSON.parse(textData);
          if (jsonData && jsonData.error) {
             throw new Error("Pesan Server: " + jsonData.error);
          }
          setMediaList(jsonData);
        } catch (e) {
          throw new Error("Server tidak mengembalikan data yang valid. Pastikan URL benar dan sudah New Version.");
        }
        
      } catch (err) {
        console.error(err);
        setError(err.message || "Gagal memuat daftar media.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR KIRI - Daftar Video */}
      <div className="w-full md:w-1/3 max-w-sm border-r border-gray-200 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-white z-10 h-full flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Video className="text-purple-600" /> Iska Tube
        </h2>

        {/* State Loading */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-sm text-gray-500">Memuat video...</p>
          </div>
        )}

        {/* State Error */}
        {error && !isLoading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* List Video */}
        {!isLoading && !error && (
          <div className="space-y-3 pb-8">
            {mediaList.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-10">Belum ada video tersedia.</p>
            ) : (
              mediaList.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => setActiveMedia(m)} 
                  className={`p-2.5 rounded-2xl cursor-pointer transition-all duration-200 flex gap-3 items-center ${
                    activeMedia?.id === m.id 
                      ? 'bg-purple-50 border border-purple-200 shadow-sm' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="w-24 h-16 md:w-28 md:h-20 rounded-xl overflow-hidden shrink-0 bg-gray-200 shadow-sm relative">
                    <img src={m.thumb} alt={m.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {/* Ikon Play Kecil di atas Thumbnail */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                       <PlayCircle size={20} className="text-white opacity-80" fill="currentColor" />
                    </div>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 leading-tight mb-1">{m.title}</h4>
                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] md:text-xs rounded-full font-medium uppercase tracking-wide">
                      {m.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* AREA UTAMA - Video Player */}
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-y-auto">
        {activeMedia ? (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Player Container */}
            <div className="w-full bg-black rounded-2xl md:rounded-3xl aspect-video shadow-2xl flex items-center justify-center text-white relative overflow-hidden">
              {activeMedia.embedUrl ? (
                <iframe 
                  src={activeMedia.embedUrl} 
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  title={activeMedia.title}
                ></iframe>
              ) : (
                <div className="text-center p-6">
                  <AlertCircle size={48} className="mx-auto mb-4 text-red-400 opacity-80" />
                  <p>Link video tidak valid atau tidak dapat diputar.</p>
                </div>
              )}
            </div>
            
            {/* Detail Video Aktif */}
            <div className="w-full mt-6 px-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{activeMedia.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg shadow-sm font-medium">
                  {activeMedia.category}
                </span>
                <span>•</span>
                <span>Sumber: {activeMedia.type}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 flex flex-col items-center max-w-sm text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <PlayCircle size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada video dipilih</h3>
            <p className="text-sm">Silakan pilih video dari daftar di sebelah kiri untuk mulai menonton secara langsung.</p>
          </div>
        )}
      </div>

    </div>
  );
}