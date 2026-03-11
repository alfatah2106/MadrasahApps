import React, { useState, useEffect } from 'react';
import { FileText, Send, Plus, Save, X, Loader2 } from 'lucide-react';
import { Student } from '../types'; // Mengimpor interface Student dari types.ts

// ==========================================
// CONFIGURATION URL GOOGLE APPS SCRIPT
// ==========================================
const CONFIG = {
  GAS_WEB_APP_URL: import.meta.env.VITE_GAS_TUGAS_URL || "" 
};

interface Task {
  id: string; 
  title: string;
  type: 'docs' | 'sheets' | 'slides';
  status: 'Belum Selesai' | 'Terkirim' | 'Selesai';
  fileUrl?: string; 
}

interface TugasProps {
  currentUser: Student;
}

export default function Tugas({ currentUser }: TugasProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newType, setNewType] = useState<'docs' | 'sheets' | 'slides'>('docs');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Ambil data dari sheet khusus untuk email siswa yang login
  useEffect(() => {
    fetchTasksFromGoogleSheet();
  }, [currentUser]);

  const fetchTasksFromGoogleSheet = async () => {
    if (!CONFIG.GAS_WEB_APP_URL) return;

    setIsFetching(true);
    try {
      const response = await fetch(`${CONFIG.GAS_WEB_APP_URL}?action=getTasks&email=${currentUser.email}`);
      const result = await response.json();
      
      if (result.success) {
        setTasks(result.data);
      } else {
        console.error("Gagal mengambil data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
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
          kelas: currentUser.kelas, // MENGIRIM DATA KELAS KE GOOGLE SHEET
          title: newTaskTitle,
          type: newType
        })
      });

      const result = await response.json();

      if (result.success) {
        const newTask: Task = {
          id: result.taskId,
          title: newTaskTitle,
          type: newType,
          status: 'Belum Selesai',
          fileUrl: result.fileUrl
        };
        setTasks([newTask, ...tasks]);
        setShowCreate(false);
        setNewTaskTitle('');
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
      setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Terkirim' } : t));
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
      
      const result = await response.json();
      if(result.success) {
        alert('Tugas berhasil dikirim!');
      } else {
        alert('Status diubah di lokal, tapi gagal tersimpan ke server.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Tampilan Form Buat Tugas Baru
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas</label>
              <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} disabled={isLoading} required className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-5 py-4 outline-none transition-all text-gray-800" placeholder="Contoh: Makalah Sejarah..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis File</label>
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

  // Tampilan Iframe File Google Drive
  if (activeTask) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <h3 className="font-semibold text-lg text-gray-800">{activeTask.title}</h3>
          <div className="flex gap-3">
            <button onClick={() => alert('Otomatis tersimpan di Google Drive')} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"><Save size={18} /> Disimpan</button>
            <button onClick={() => handleSend(activeTask.id)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"><Send size={18} /> Kirim ke Guru</button>
            <button onClick={() => setActiveTask(null)} className="px-5 py-2.5 bg-gray-50 rounded-xl font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">Tutup File</button>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-100 p-2">
          {activeTask.fileUrl ? (
            <iframe 
              src={`${activeTask.fileUrl}?rm=minimal`} 
              className="w-full h-full rounded-xl shadow-sm border border-gray-200 bg-white"
              title="Google Editor"
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

  // Tampilan Utama Daftar Tugas
  return (
    <div className="p-8 h-full flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Tugas Anda</h2>
           <p className="text-gray-500 text-sm mt-1">Daftar file tugas yang terhubung dengan Google Drive Anda.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2">
          <Plus size={18} /> Buat Tugas Baru
        </button>
      </div>
      
      {isFetching ? (
        <div className="flex-1 flex justify-center items-center text-gray-500 gap-3">
            <Loader2 className="animate-spin" size={24} /> Membaca data dari Google Sheet...
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <FileText size={48} className="mb-4 opacity-20" />
          <p>Belum ada tugas yang dibuat.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto no-scrollbar pb-8">
          {tasks.map(task => (
            <div key={task.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group">
               <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm ${task.type === 'docs' ? 'bg-blue-500' : task.type === 'sheets' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  <FileText size={28} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">Google {task.type === 'docs' ? 'Docs' : task.type === 'sheets' ? 'Sheets' : 'Slides'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-4 py-1.5 text-xs font-bold rounded-full tracking-wide ${task.status === 'Terkirim' || task.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {task.status}
                </span>
                <button onClick={() => setActiveTask(task)} className="px-6 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 border border-gray-200 transition-colors group-hover:border-gray-300">Buka</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}