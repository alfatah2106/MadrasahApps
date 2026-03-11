import React, { useState, useEffect } from 'react';
import { PenTool, Link as LinkIcon, Maximize2, Minimize2, Copy, Check, Play, X, Globe, Users, Lock, Unlock } from 'lucide-react';

export default function PapanTulis() {
  const [expandedPane, setExpandedPane] = useState(null); // 'teacher' | 'student' | null

  // State untuk Papan Guru
  const [teacherLink, setTeacherLink] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isTeacherLocked, setIsTeacherLocked] = useState(true);

  // State untuk Papan Siswa
  const [isStudentLocked, setIsStudentLocked] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myMockLink, setMyMockLink] = useState('');

  // Generate mock link pada saat komponen dimuat
  useEffect(() => {
    const randomId = Math.random().toString(36).substring(2, 15);
    const randomKey = Math.random().toString(36).substring(2, 15);
    setMyMockLink(`https://excalidraw.com/#room=${randomId},${randomKey}`);
  }, []);

  const handleStartLive = (e) => {
    e.preventDefault();
    if (teacherLink.trim() !== '') {
      setIsLive(true);
      setIsTeacherLocked(true); // Memastikan selalu mulai dengan mode view/terkunci
      setExpandedPane('teacher');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(myMockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleExpand = (pane) => {
    if (expandedPane === pane) {
      setExpandedPane(null);
    } else {
      setExpandedPane(pane);
    }
  };

  // Helper class untuk animasi panel yang fleksibel
  const getPanelClass = (paneType) => {
    const baseClass = "bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative transition-all duration-500 ease-in-out";

    if (expandedPane === paneType) {
      return `${baseClass} flex-[3] shadow-lg ring-2 ring-blue-100`;
    } else if (expandedPane !== null) {
      return `${baseClass} flex-[1]`; // Dihapus efek hover dan cursor agar tidak terlihat seperti bisa diklik sembarangan
    }
    return `${baseClass} flex-[1]`; // Default 50/50 state
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 font-sans">
      {/* Header Utama */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 leading-tight">Papan Tulis Kolaborasi</h2>
            <p className="text-xs text-gray-500">Didukung oleh Excalidraw Public Server</p>
          </div>
        </div>
        <button
          onClick={() => setExpandedPane(null)}
          className="px-5 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-200"
        >
          Reset Tampilan Layar
        </button>
      </div>

      {/* Konten Utama - Split View */}
      <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">

        {/* ================= PAPAN GURU (LIVE BOARD) ================= */}
        <div
          className={getPanelClass('teacher')}
        >
          {/* Header Panel Guru */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${isLive ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>
                <PenTool size={16} />
              </div>
              <h3 className="font-semibold text-gray-700">Papan Tulis Guru</h3>
              {isLive && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div> LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsTeacherLocked(!isTeacherLocked); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isTeacherLocked
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {isTeacherLocked ? <><Lock size={14} /> Mode View</> : <><Unlock size={14} /> Mode Edit</>}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsLive(false); }}
                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-red-100"
                  >
                    <X size={14} /> Tutup Live
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                </>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand('teacher'); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                title={expandedPane === 'teacher' ? "Perkecil" : "Perbesar"}
              >
                {expandedPane === 'teacher' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>

          {/* Area Konten Guru */}
          <div className="flex-1 bg-slate-50 relative flex flex-col overflow-hidden">
            {!isLive ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <LinkIcon size={28} />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Sambungkan ke Papan Guru</h4>
                <p className="text-sm text-gray-500 mb-6 max-w-sm">
                  Masukkan link Excalidraw dari guru Anda di sini untuk mulai menonton sesi secara live.
                </p>

                <form onSubmit={handleStartLive} className="w-full max-w-md flex flex-col gap-3">
                  <input
                    type="url"
                    required
                    value={teacherLink}
                    onChange={(e) => setTeacherLink(e.target.value)}
                    placeholder="https://excalidraw.com/#room=..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Play size={18} /> Mulai Nonton
                  </button>
                </form>
              </div>
            ) : (
              <>
                <iframe
                  src={teacherLink}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Papan Tulis Guru Live"
                  allow="clipboard-read; clipboard-write"
                />

                {/* Lapisan Pelindung agar Papan Guru hanya "View Only" saat terkunci */}
                {isTeacherLocked && (
                  <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed" title="Klik Mode Edit di atas untuk berinteraksi"></div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ================= PAPAN SISWA ================= */}
        <div
          className={getPanelClass('student')}
        >
          {/* Header Panel Siswa */}
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 text-green-600 rounded-md">
                <PenTool size={16} />
              </div>
              <h3 className="font-semibold text-gray-700">Catatan Saya</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsStudentLocked(!isStudentLocked); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isStudentLocked
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                title="Kunci papan Anda agar tidak bisa dicoret"
              >
                {isStudentLocked ? <><Lock size={14} /> Terkunci</> : <><Unlock size={14} /> Mode Edit</>}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowLinkPopup(true); }}
                className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-green-200"
              >
                <Users size={14} /> Bagikan Papan
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand('student'); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                title={expandedPane === 'student' ? "Perkecil" : "Perbesar"}
              >
                {expandedPane === 'student' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>

          {/* Area Konten Siswa (Excalidraw Embed) */}
          <div className="flex-1 relative bg-white">
            <iframe
              src="https://excalidraw.com/"
              className="absolute inset-0 w-full h-full border-0"
              title="Catatan Saya Excalidraw"
              allow="clipboard-read; clipboard-write"
            />
            {/* Lapisan Pelindung agar Papan Siswa "View Only" saat terkunci */}
            {isStudentLocked && (
              <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed" title="Papan terkunci, klik Mode Edit di atas untuk membuka"></div>
            )}
          </div>
        </div>

      </div>

      {/* ================= MODAL POPUP LINK ================= */}
      {showLinkPopup && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Bagikan Papan Anda</h3>
              <button
                onClick={() => setShowLinkPopup(false)}
                className="p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Berikan link di bawah ini kepada guru atau teman Anda agar mereka bisa bergabung melihat dan mencoret-coret papan Anda.
              </p>

              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  readOnly
                  value={myMockLink}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                    copied ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {copied ? <><Check size={16}/> Tersalin</> : <><Copy size={16}/> Salin</>}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                <div className="mt-0.5">
                  <Globe size={16} />
                </div>
                <p>
                  <strong>Penting:</strong> Jika Anda menggunakan fitur kolaborasi langsung di dalam aplikasi Excalidraw, gunakan tombol ikon dua-orang di pojok kanan atas layar Excalidraw untuk mendapatkan link E2EE asli.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
