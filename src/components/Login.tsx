import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { BookOpen } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

export default function Login({ onLogin }: { onLogin: (s: Student) => void }) {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [nis, setNis] = useState('');
  const [kelas, setKelas] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '142276774829-q7b6vicbq1hm1ltng7itehietn03l119.apps.googleusercontent.com',
          callback: (response: any) => {
            // Decode JWT to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            setGoogleUser({
              name: payload.name,
              email: payload.email,
              picture: payload.picture
            });
          }
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nis && kelas && googleUser) {
      onLogin({
        ...googleUser,
        nis,
        kelas
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <BookOpen size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Madrasah App</h2>
        <p className="text-center text-gray-500 mb-8">Masuk untuk mengakses materi dan tugas</p>

        {!googleUser ? (
          <div className="flex flex-col items-center">
            <div id="google-btn" className="w-full flex justify-center min-h-[40px]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-6 border border-blue-100">
              <img src={googleUser.picture} alt="Profile" className="w-12 h-12 rounded-full shadow-sm" referrerPolicy="no-referrer" />
              <div>
                <p className="text-sm font-bold text-gray-800">{googleUser.name}</p>
                <p className="text-xs text-gray-500">{googleUser.email}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">NIS (Nomor Induk Siswa)</label>
              <input 
                type="text" 
                required
                value={nis}
                onChange={e => setNis(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="Masukkan NIS Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kelas</label>
              <input 
                type="text" 
                required
                value={kelas}
                onChange={e => setKelas(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="Contoh: 10A, 11 IPA 1..."
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md mt-6 active:scale-[0.98]">
              Lanjutkan Masuk
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
