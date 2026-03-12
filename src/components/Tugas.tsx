import React, { useState, useEffect } from 'react';
// Tambahkan icon ClipboardList untuk representasi Form
import { FileText, Send, Plus, Save, X, Loader2, Trash2, Users, ClipboardList } from 'lucide-react';
import { Student } from '../types';

const CONFIG = {
  GAS_WEB_APP_URL: import.meta.env.VITE_GAS_TUGAS_URL || ""
};

interface Task {
  id: string;
  title: string;
  type: 'docs' | 'sheets' | 'slides' | 'form'; // Tambahkan tipe 'form'
  status: 'Belum Selesai' | 'Terkirim' | 'Selesai';
  fileUrl?: string;
  kelas?: string;
  mapel?: string;
  isPublic?: boolean;
  isOwner?: boolean;
}

interface TugasProps {
  currentUser: Student;
}

export default function Tugas({ currentUser }: TugasProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newMapel, setNewMapel] = useState('');
  const [newType, setNewType] = useState<'docs' | 'sheets' | 'slides'>('docs');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const CACHE_KEY = `tugas_cache_${currentUser.email}`;
  const CACHE_TIME_KEY = `tugas_cache_time_${currentUser.email}`;
  const CACHE_DURATION = 24 * 60 * 60 * 1000;

  useEffect(() => {
    fetchTasksFromGoogleSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchTasksFromGoogleSheet = async (isBackground = false) => {
    if (!CONFIG.GAS_WEB_APP_URL) return;

    if (!isBackground) {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

      if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime) < CACHE_DURATION)) {
        setTasks(JSON.parse(cachedData));
        fetchTasksFromGoogleSheet(true);
        return;
      }
      setIsFetching(true);
    }

    try {
      const response = await fetch(`${CONFIG.GAS_WEB_APP_URL}?action=getTasks&email=${currentUser.email}&kelas=${currentUser.kelas}`);
      const result = await response.json();

      if (result.success) {
        setTasks(result.data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(result.data));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      } else {
        console.error("Gagal mengambil data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      if (!isBackground) setIsFetching(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newMapel.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'createTask',
          email: currentUser.email,
          name: currentUser.name,
          nis: currentUser.nis,
          kelas: currentUser.kelas,
          mapel: newMapel,
          title: newTaskTitle,
          type: newType
        })
      });

      const result = await response.json();

      if (result.success) {
        const newTask: Task = {
          id: result.taskId,
          title: newTaskTitle,
          mapel: newMapel,
          kelas: currentUser.kelas,
          type: newType,
          status: 'Belum Selesai',
          fileUrl: result.fileUrl,
          isPublic: false,
          isOwner: true
        };
        const updatedTasks = [newTask, ...tasks];

        setTasks(updatedTasks);
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedTasks));

        setShowCreate(false);
        setNewTaskTitle('');
        setNewMapel('');
        setActiveTask(newTask);
      } else {
        alert("Gagal membuat dokumen: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (id: string) => {
    try {
      const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: 'Terkirim' as const } : t);
      setTasks(updatedTasks);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedTasks));
      setActiveTask(null);

      const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateStatus',
          taskId: id,
          status: 'Terkirim'
        })
      });

      const responseData = await response.json();
      if(responseData.success) {
        alert('Tugas berhasil dikirim!');
      } else {
        alert('Status diubah di lokal, tapi gagal tersimpan ke server.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Apakah Anda yakin ingin menghapus tugas ini secara permanen?")) return;

    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedTasks));

    try {
      await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'deleteTask',
          taskId: id,
          email: currentUser.email
        })
      });
    } catch (error) {
      console.error("Gagal menghapus ke server", error);
    }
  };

  if (showCreate) {
    return (
      <div className="h-full flex flex-col p-8 bg-gray-50">
        <div className="max-w-2xl w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Buat Tugas Baru</h2>
            <button onClick={() => setShowCreate(false)} disabled={isLoading} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-500" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
              <input type="text" value={newMapel} onChange={e => setNewMapel(e.target.value)} disabled={isLoading} required className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-5 py-4 outline-none transition-all text-gray-800" placeholder="Contoh: Matematika..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas</label>
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} disabled={isLoading} required className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-5 py-4 outline-none transition-all text-gray-800" placeholder="Contoh: Makalah Sejarah..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis File</label>
              {/* Catatan: Opsi 'form' sengaja tidak dimasukkan ke sini agar siswa tidak bisa membuat Form */}
              <div className="grid grid-cols-3 gap-4">
                <button type="button" onClick={() => setNewType('docs')} disabled={isLoading} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newType === 'docs' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                  <FileText size={32} className={newType === 'docs' ? 'text-blue-600' : ''} />
                  <span className="font-medium">Document</span>
                </button>
                 <button type="button" onClick={() => setNewType('sheets')} disabled={isLoading} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newType === 'sheets' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                  <FileText size={32} className={newType === 'sheets' ? 'text-green-600' : ''} />
                  <span className="font-medium">Spreadsheet</span>
                </button>
                <button type="button" onClick={() => setNewType('slides')} disabled={isLoading} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newType === 'slides' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
                  <FileText size={32} className={newType === 'slides' ? 'text-yellow-600' : ''} />
                  <span className="font-medium">Presentation</span>
                </button>
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm flex justify-center items-center gap-2">
                {isLoading ? <><Loader2 className="animate-spin" size={20} /> Membuat di Google Drive...</> : 'Buat & Buka File'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (activeTask) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 md:p-4 border-b border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-white z-10 gap-3">
          <div className="flex flex-col">
            <h3 className="font-semibold text-base md:text-lg text-gray-800 truncate w-full md:w-auto flex items-center gap-2">
              {activeTask.title}
              {!activeTask.isOwner && activeTask.type === 'form' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Ujian / Kuis</span>}
              {!activeTask.isOwner && activeTask.type !== 'form' && <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Read-Only</span>}
            </h3>
            <p className="text-xs text-gray-500 font-medium">{activeTask.mapel} &bull; Kelas {activeTask.kelas}</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {/* Tombol Simpan tidak relevan untuk form yang disubmit via GForm */}
            {activeTask.type !== 'form' && (
              <button onClick={() => alert('Otomatis tersimpan di Google Drive')} className="px-3 md:px-5 py-2 md:py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm md:text-base font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5 md:gap-2 whitespace-nowrap"><Save size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Disimpan</span></button>
            )}

            {activeTask.isOwner && (
              <button onClick={() => handleSend(activeTask.id)} className="px-3 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white rounded-xl text-sm md:text-base font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5 md:gap-2 whitespace-nowrap"><Send size={16} className="md:w-[18px] md:h-[18px]" /> Kirim <span className="hidden sm:inline">ke Guru</span></button>
            )}

            <button onClick={() => setActiveTask(null)} className="px-3 md:px-5 py-2 md:py-2.5 bg-gray-50 rounded-xl text-sm md:text-base font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors whitespace-nowrap">Tutup</button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 p-2">
          {activeTask.fileUrl ? (
            <iframe
              // Jika ini adalah form, jangan tambahkan parameter rm=minimal agar UI form berjalan normal
              src={activeTask.type === 'form' ? activeTask.fileUrl : `${activeTask.fileUrl}?rm=minimal`}
              className="w-full h-full rounded-xl shadow-sm border border-gray-200 bg-white"
              title={activeTask.type === 'form' ? "Google Form" : "Google Editor"}
              allow="clipboard-read; clipboard-write"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-red-500">
              URL Dokumen Tidak Ditemukan
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-gray-50/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tugas & Ujian</h2>
           <p className="text-gray-500 text-sm mt-1">Daftar tugas mandiri dan ujian kelas Anda.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="w-full md:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm transition-colors flex justify-center items-center gap-2">
          <Plus size={18} /> Buat Tugas Baru
        </button>
      </div>

      {isFetching && tasks.length === 0 ? (
        <div className="flex-1 flex justify-center items-center text-gray-500 gap-3">
            <Loader2 className="animate-spin" size={24} /> Membaca data dari server...
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <FileText size={48} className="mb-4 opacity-20" />
          <p>Belum ada tugas atau ujian saat ini.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto no-scrollbar pb-8">
          {tasks.map(task => (
            <div key={task.id} className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
               <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                  task.type === 'docs' ? 'bg-blue-500' :
                  task.type === 'sheets' ? 'bg-green-500' :
                  task.type === 'slides' ? 'bg-yellow-500' :
                  'bg-purple-500' // Warna ungu untuk form
                }`}>
                  {task.type === 'form' ? (
                     <ClipboardList size={24} className="md:w-7 md:h-7" />
                  ) : (
                     <FileText size={24} className="md:w-7 md:h-7" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate">{task.title}</h3>
                    {!task.isOwner && <Users size={16} className="text-purple-500" title="Ujian / Tugas Kelas" />}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">
                    {task.mapel} &bull; {task.type === 'docs' ? 'Docs' : task.type === 'sheets' ? 'Sheets' : task.type === 'slides' ? 'Slides' : 'Google Forms'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between w-full md:w-auto gap-3 md:gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                {/* Sembunyikan status 'Belum Selesai' jika itu form publik (karena status form diatur oleh form itu sendiri) */}
                {!(task.type === 'form' && !task.isOwner) && (
                  <span className={`px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-bold rounded-full tracking-wide ${task.status === 'Terkirim' || task.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {task.status}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {task.isOwner && !task.isPublic && (
                    <button onClick={() => handleDelete(task.id)} className="p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100" title="Hapus Tugas">
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button onClick={() => setActiveTask(task)} className="px-5 py-2 md:px-6 md:py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm md:text-base font-medium hover:bg-gray-100 border border-gray-200 transition-colors group-hover:border-gray-300">
                    Buka {task.type === 'form' && 'Ujian'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
