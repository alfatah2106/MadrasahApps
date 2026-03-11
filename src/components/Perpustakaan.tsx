import React, { useState, useEffect } from 'react';

// Link API Google Apps Script Anda
const GAS_WEB_APP_URL = import.meta.env.VITE_GAS_PERPUSTAKAAN_URL || "";

export default function Perpustakaan() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePdf, setActivePdf] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(GAS_WEB_APP_URL, {
          method: "GET",
          redirect: "follow"
        });
        
        if (!response.ok) {
          throw new Error('Gagal terhubung ke server perpustakaan.');
        }
        
        const textData = await response.text();
        
        try {
          const jsonData = JSON.parse(textData);
          if (jsonData && jsonData.error) {
             throw new Error("Pesan dari Server: " + jsonData.error);
          }
          setBooks(jsonData);
        } catch (e) {
          console.error("Bukan JSON atau Error Parse:", textData, e);
          throw new Error(e.message.includes("Pesan dari Server") ? e.message : "Server tidak mengembalikan data buku yang valid.");
        }
        
      } catch (err) {
        console.error("Error mengambil data:", err);
        setError(err.message || "Gagal memuat daftar buku. Periksa koneksi internet Anda.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Tampilan saat buku di-klik (Membaca PDF)
  if (activePdf) {
    return (
      // Perbaikan Scroll: h-full
      <div className="h-full flex flex-col bg-gray-50 relative">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm sticky top-0">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{activePdf.title}</h3>
            <p className="text-sm text-gray-500">{activePdf.category}</p>
          </div>
          <div className="flex gap-2">
            <a 
              href={activePdf.pdfLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-teal-600 rounded-xl font-medium text-white hover:bg-teal-700 transition-colors hidden sm:block text-sm"
            >
              Buka di Tab Baru
            </a>
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
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    );
  }

  // Tampilan Utama (Rak Buku)
  return (
    // Perbaikan Scroll: Menambahkan h-full dan overflow-y-auto di parent paling luar
    <div className="h-full overflow-y-auto p-6 md:p-8 bg-gray-50 custom-scrollbar">
      <div className="max-w-6xl mx-auto pb-10">
        <h2 className="text-3xl font-bold text-teal-800 mb-2">Perpustakaan Digital</h2>
        <p className="text-gray-600 mb-8">Pilih buku untuk mulai membaca</p>

        {/* Indikator Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat koleksi buku...</p>
          </div>
        )}

        {/* Pesan Error */}
        {error && !isLoading && (
          <div className="bg-red-50 text-red-600 p-5 rounded-xl border border-red-200 text-center shadow-sm max-w-2xl mx-auto">
            <p className="font-bold mb-1">Oops, terjadi kesalahan!</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Jika Tidak Ada Buku */}
        {!isLoading && !error && books.length === 0 && (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            Belum ada buku yang tersedia di perpustakaan saat ini.
          </div>
        )}

        {/* Grid Buku */}
        {!isLoading && !error && books.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map(book => (
              <div 
                key={book.id} 
                onClick={() => setActivePdf(book)} 
                className="group cursor-pointer flex flex-col bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 mb-4">
                  <img 
                    src={book.cover} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x600?text=Buku";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                    {book.category}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 px-1 leading-snug">
                  {book.title}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}