import React, { useState } from 'react';
import { Tldraw, TLEditor } from 'tldraw';
import 'tldraw/tldraw.css';
import {
  PenTool, Maximize2, Minimize2, X, Globe, Lock, Unlock, Play, Layout, Video, MonitorPlay
} from 'lucide-react';

// Mengimpor tipe dari file types.ts yang berada satu tingkat di atas folder ini
import type { PapanProps } from '../types';

/* BENTUK TYPES.TS (Sebagai Referensi):
  export interface PapanProps {
    name: string;
    zoomLink?: string;
    meetLink?: string;
  }
*/

export default function PapanTulis({
  name,
  zoomLink = "https://zoom.us/join?",
  meetLink = "https://meet.google.com"
}: PapanProps) {
  const [expandedPane, setExpandedPane] = useState<'teacher' | 'student' | null>(null);

  // State Papan Guru
  const [teacherLink, setTeacherLink] = useState('');
  const [teacherRoomId, setTeacherRoomId] = useState('');
  const [isLive, setIsLive] = useState(false);

  // State Papan Siswa
  const [isStudentLocked, setIsStudentLocked] = useState(false);
  const [studentEditor, setStudentEditor] = useState<TLEditor | null>(null);

  // Handler URL tldraw guru
  const handleStartLive = (e: React.FormEvent) => {
    e.preventDefault();
    const match = teacherLink.match(/\/(?:f|v)\/([a-zA-Z0-9_-]+)/);
    const roomId = match ? match[1] : teacherLink;

    if (roomId) {
      setTeacherRoomId(roomId);
      setIsLive(true);
      setExpandedPane('teacher');
    }
  };

  const toggleStudentLock = () => {
    const newLockState = !isStudentLocked;
    setIsStudentLocked(newLockState);
    if (studentEditor) {
      studentEditor.updateInstanceState({ isReadonly: newLockState });
    }
  };

  const toggleExpand = (pane: 'teacher' | 'student') => {
    setExpandedPane(expandedPane === pane ? null : pane);
  };

  const getPanelClass = (paneType: 'teacher' | 'student') => {
    const baseClass = "bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative transition-all duration-500 ease-in-out";
    if (expandedPane === paneType) return `${baseClass} flex-[3] shadow-lg ring-2 ring-indigo-100`;
    if (expandedPane !== null) return `${baseClass} flex-[1]`;
    return `${baseClass} flex-[1]`;
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 font-sans overflow-hidden">
      {/* ================= HEADER UTAMA ================= */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hidden md:block">
            <Layout size={24} />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">Papan Kolaborasi</h2>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">
              Login sebagai: <span className="font-bold text-indigo-600">{name}</span>
            </p>
          </div>
        </div>

        {/* Tombol Meeting (Buka di Tab yang Sama) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.href = zoomLink}
            className="px-3 py-2 md:px-4 md:py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 border border-blue-200 transition-all flex items-center gap-2"
          >
            <MonitorPlay size={16} />
            <span className="hidden md:inline">Buka Zoom</span>
          </button>
          <button
            onClick={() => window.location.href = meetLink}
            className="px-3 py-2 md:px-4 md:py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 border border-green-200 transition-all flex items-center gap-2"
          >
            <Video size={16} />
            <span className="hidden md:inline">Google Meet</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">

        {/* ================= PAPAN GURU (VIEW ONLY STRICT) ================= */}
        <div className={getPanelClass('teacher')}>
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${isLive ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                <Globe size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm md:text-base">Papan Guru (Melihat)</h3>
              {isLive && <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>}
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <>
                  <span className="px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 bg-gray-200 text-gray-600 cursor-not-allowed">
                    <Lock size={12} /> View Only
                  </span>
                  <button onClick={() => setIsLive(false)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><X size={18}/></button>
                </>
              )}
              <button onClick={() => toggleExpand('teacher')} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-md transition-colors">
                {expandedPane === 'teacher' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-slate-50">
            {!isLive ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                  <Play size={28} />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Pantau Penjelasan Guru</h4>
                <p className="text-sm text-gray-500 mb-6 max-w-xs text-balance">
                  Tempel link tldraw dari Guru Anda. Anda hanya dapat melihat, layar akan otomatis mengikuti posisi Guru.
                </p>
                <form onSubmit={handleStartLive} className="w-full max-w-sm flex flex-col gap-2">
                  <input
                    type="url"
                    required
                    value={teacherLink}
                    onChange={(e) => setTeacherLink(e.target.value)}
                    placeholder="https://www.tldraw.com/f/..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                  />
                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                    HUBUNGKAN
                  </button>
                </form>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                {/* Menyisipkan parameter nama ke dalam iframe tldraw */}
                <iframe
                  src={`https://www.tldraw.com/f/${teacherRoomId}?embed=1&name=${encodeURIComponent(name)}`}
                  className="w-full h-full border-0"
                  allow="clipboard-read; clipboard-write"
                  title="Papan Guru"
                />
                {/* Overlay transparan permanen agar siswa benar-benar tidak bisa mengedit atau menggeser sendiri */}
                <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed" title="Anda hanya bisa melihat" />
              </div>
            )}
          </div>
        </div>

        {/* ================= PAPAN SISWA (CATATAN PRIBADI) ================= */}
        <div className={getPanelClass('student')}>
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md">
                <PenTool size={16} />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm md:text-base">Catatan Saya</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleStudentLock}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all ${
                  isStudentLocked ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isStudentLocked ? <><Lock size={12} /> Terkunci</> : <><Unlock size={12} /> Aktif</>}
              </button>
              <button onClick={() => toggleExpand('student')} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-md transition-colors">
                {expandedPane === 'student' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <Tldraw
              inferDarkMode
              autoFocus={false}
              onMount={(editor) => setStudentEditor(editor)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
