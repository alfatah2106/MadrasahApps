import React, { useState, useEffect } from 'react';
import { PlayCircle, Video, Search, AlertCircle } from 'lucide-react';

const GAS_TUBE_URL = import.meta.env.VITE_GAS_MEDIA_URL || "";
const CACHE_KEY = "iska_tube_cache";
const CACHE_TIME = 24 * 60 * 60 * 1000; // 1 Hari dalam milidetik

export default function Media() {
  const [mediaList, setMediaList] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // 1. Coba ambil data dari Cache terlebih dahulu
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_TIME;

        setMediaList(data);
        setIsLoading(false);

        // Jika data belum expired, tidak perlu fetch ulang
        if (!isExpired) return;
      }

      // 2. Fetch data baru dari server (tetap jalan jika cache expired atau kosong)
      try {
        const response = await fetch(GAS_TUBE_URL, { method: "GET", redirect: "follow" });
        const textData = await response.text();
        const jsonData = JSON.parse(textData);

        // 3. Simpan data baru ke State dan LocalStorage
        setMediaList(jsonData);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: jsonData,
          timestamp: Date.now()
        }));

        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        if (!mediaList.length) setError("Gagal memuat daftar video.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMedia = mediaList.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">

      {/* 1. SEARCH BAR AREA */}
      <div className="p-3 md:p-4 border-b border-gray-100 flex justify-center bg-white z-20 shadow-sm">
        <div className="relative w-full max-w-3xl flex">
          <input
            type="text"
            placeholder="Cari materi Iska..."
            className="w-full bg-gray-50 border border-gray-300 rounded-l-xl px-4 py-2 outline-none focus:border-purple-500 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="bg-gray-100 border border-l-0 border-gray-300 px-4 rounded-r-xl hover:bg-gray-200">
            <Search size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">

        {/* 2. VIDEO PLAYER AREA (Optimasi Android 35vh) */}
        <div className="w-full lg:flex-1 bg-black flex items-center justify-center relative h-[35vh] md:h-auto border-b border-gray-200 lg:border-b-0 shadow-inner">
          {activeMedia ? (
            <iframe
              src={activeMedia.embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={activeMedia.title}
            ></iframe>
          ) : (
            <div className="text-center px-6">
              <Video size={32} className="text-gray-800 mx-auto mb-2 opacity-40" />
              <p className="text-gray-500 text-xs font-medium">Pilih video dari daftar di bawah</p>
            </div>
          )}
        </div>

        {/* 4. LIST DAFTAR VIDEO (Sidebar) */}
        <div className="w-full lg:w-96 bg-white flex flex-col overflow-hidden shadow-2xl">
          <div className="p-3 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-gray-800 text-sm tracking-tight">Daftar Materi</h3>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                {filteredMedia.length} Video
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {isLoading && mediaList.length === 0 ? (
              <div className="flex flex-col gap-2">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              filteredMedia.map(m => (
                <div
                  key={m.id}
                  onClick={() => setActiveMedia(m)}
                  className={`flex gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                      activeMedia?.id === m.id
                      ? 'bg-purple-50 border-purple-200 shadow-sm'
                      : 'hover:bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="relative w-24 h-14 md:w-28 md:h-16 shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-sm">
                    <img src={m.thumb} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                        <PlayCircle size={20} className={`text-white transition-opacity ${activeMedia?.id === m.id ? 'opacity-100' : 'opacity-0'}`} fill="currentColor" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className={`text-[11px] md:text-xs font-bold line-clamp-2 leading-tight ${activeMedia?.id === m.id ? 'text-purple-700' : 'text-gray-800'}`}>
                      {m.title}
                    </h4>
                    <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-wider">{m.category}</span>
                  </div>
                </div>
              ))
            )}

            {!isLoading && filteredMedia.length === 0 && !error && (
              <p className="text-center py-10 text-xs text-gray-400 font-medium">Video tidak ditemukan.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
