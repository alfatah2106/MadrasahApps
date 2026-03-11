import React, { useEffect } from 'react';

const RedirectToGemini = () => {
  useEffect(() => {
    // Menggunakan location.assign agar halaman saat ini diganti,
    // tapi tetap tersimpan di history (bisa ditekan tombol 'Back')
    window.location.assign('https://gemini.google.com');

    // Jika Anda ingin user TIDAK BISA kembali ke halaman PWA awal,
    // gunakan: window.location.replace('https://gemini.google.com');
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-medium">Menghubungkan ke Gemini...</p>
        <span className="text-sm text-gray-500 italic">Mohon tunggu sebentar</span>
      </div>
    </div>
  );
};

export default RedirectToGemini;
