import React, { useState, useEffect, useMemo } from 'react';

const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_PERPUSTAKAAN_URL || "";
const CACHE_KEY = "perpustakaan_data";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 1 Hari dalam ms

export default function Perpustakaan() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePdf, setActivePdf] = useState(null);

  // Fungsi Fetch Data
  const fetchBooks = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);

      const response = await fetch(GAS_WEB_APP_URL, {
        method: "GET",
        redirect: "follow"
      });

      if (!response.ok) throw new Error('Gagal terhubung ke server.');

      const jsonData = await response.json();

      if (jsonData && jsonData.error) throw new Error(jsonData.error);

      // Simpan ke LocalStorage beserta Timestamp
      const cacheData = {
        timestamp: Date.now(),
        data: jsonData
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setBooks(jsonData);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    const localData = localStorage.getItem(CACHE_KEY);

    if (localData) {
      const parsedCache = JSON.parse(localData);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRATION;

      // Set data dari cache dulu agar cepat muncul
      setBooks(parsedCache.data);
      setIsLoading(false);

      // Jika sudah expired atau ingin "selalu cek terbaru", fetch di background
      fetchBooks(true);
    } else {
      // Jika benar-benar kosong, fetch dengan loading indicator
      fetchBooks();
    }
  }, []);

  // Filter Buku berdasarkan Search Term
  const filteredBooks = useMemo(() => {
    return books.filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  if (activePdf) {
    return (
      <div className="h-full flex flex-col bg-gray-50 relative">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm sticky top-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{activePdf.title}</h3>
            <p className="text-sm text-gray-500">{activePdf.category}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActivePdf(null)}
              className="px-5 py-2.5 bg-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors text-sm"
            >
              Kembali
            </button>
          </div>
        </div>
        <div className="flex-1 p-2 md:p-4 h-full">
          <iframe
            src={activePdf.embedLink}
            className="w-full h-full min-h-[70vh] rounded-xl shadow-sm border border-gray-200 bg-white"
            title="PDF Viewer"
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-gray-50 custom-scrollbar">
      <div className="max-w-6xl mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-teal-800 mb-2">Perpustakaan Digital</h2>
            <p className="text-gray-600">Cari dan baca koleksi buku sekolah</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari judul atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {isLoading && books.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat koleksi...</p>
          </div>
        )}

        {error && books.length === 0 && (
          <div className="bg-red-50 text-red-600 p-5 rounded-xl border border-red-200 text-center shadow-sm max-w-2xl mx-auto">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Grid Buku */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map(book => (
            <div
              key={book.id}
              onClick={() => setActivePdf(book)}
              className="group cursor-pointer flex flex-col bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 mb-4">
                <img
                  src={book.cover}
                  alt={book.title}
                  // 1. Tambahkan loading lazy agar tidak membebani network di awal
                  loading="lazy"
                  // 2. Gunakan decodings async agar UI tidak freeze saat gambar diproses
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x600?text=Buku";
                  }}
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg uppercase font-bold">
                  {book.category}
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 px-1 leading-snug">
                {book.title}
              </h3>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-500">
            Buku yang Anda cari tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
