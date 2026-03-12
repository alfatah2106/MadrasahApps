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
  LogOut,
  Menu,
  X
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-50
        flex flex-col bg-white shadow-xl border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64 w-72'}
      `}>
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-100 h-20 shrink-0`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
            <div class="w-12 h-12 flex items-center justify-center shrink-0">
              <div class="w-12 h-12 flex items-center justify-center shrink-0">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0 border border-gray-100 overflow-hidden">
                  <img
                    src="/favicon.png"
                    alt="Madrasah Apps Logo"
                    className="w-7 h-7 object-contain"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">Madrasah App</h1>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title={isCollapsed ? "Perbesar Menu" : "Perkecil Menu"}
          >
            <Menu size={20} />
          </button>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={22} className={`${isActive ? 'text-blue-600' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-3'} shrink-0`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3 py-2.5'} bg-gray-50 rounded-xl border border-gray-100 mb-3 transition-all`}>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 shadow-inner">
              <img src={currentUser.picture} alt="Student" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate font-medium">Kelas {currentUser.kelas}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCurrentUser(null)}
            title={isCollapsed ? "Keluar" : undefined}
            className={`w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors ${isCollapsed ? 'px-0' : ''}`}
          >
            <LogOut size={18} className="shrink-0" /> 
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gray-100 md:p-4">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md shrink-0 border border-gray-100 overflow-hidden">
                  <img
                    src="/favicon.png"
                    alt="Madrasah Apps Logo"
                    className="w-7 h-7 object-contain"
                  />
            </div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">Madrasah App</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative md:rounded-3xl md:shadow-xl md:border md:border-gray-200 bg-white flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
