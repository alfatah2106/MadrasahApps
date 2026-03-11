/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  PenTool, 
  MessageSquare,
  LogOut
} from 'lucide-react';

import Beranda from './components/Beranda';
import Perpustakaan from './components/Perpustakaan';
import Media from './components/Media';
import Tugas from './components/Tugas';
import PapanTulis from './components/PapanTulis';
import TanyaGemini from './components/TanyaGemini';
import Login from './components/Login';
import { Student } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Student | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('beranda');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'perpustakaan', label: 'Perpustakaan', icon: BookOpen },
    { id: 'media', label: 'Media', icon: PlayCircle },
    { id: 'tugas', label: 'Tugas', icon: FileText },
    { id: 'papantulis', label: 'Papan Tulis', icon: PenTool },
    { id: 'tanyagemini', label: 'Tanya Gemini', icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'beranda': return <Beranda setTab={setActiveTab} />;
      case 'perpustakaan': return <Perpustakaan />;
      case 'media': return <Media />;
      case 'tugas': return <Tugas currentUser={currentUser} />;
      case 'papantulis': return <PapanTulis />;
      case 'tanyagemini': return <TanyaGemini />;
      default: return <Beranda setTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full p-4 gap-4 overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-64 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl flex flex-col overflow-hidden shrink-0 border border-white/20">
        <div className="p-6 flex items-center gap-4 border-b border-gray-100/50">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
            M
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Madrasah App</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 border-t border-gray-100/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/80 rounded-2xl border border-gray-100 mb-3">
            <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden shrink-0 shadow-inner">
              <img src={currentUser.picture} alt="Student" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate font-medium">Kelas {currentUser.kelas}</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden relative flex flex-col border border-white/20">
        {renderContent()}
      </main>
    </div>
  );
}
