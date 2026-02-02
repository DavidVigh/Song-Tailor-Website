'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SongRequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    target_bpm: '',
    base_bpm: '',
    deadline: '',
    youtube_link: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setStatus('loading');

  const { error } = await supabase
    .from('song_requests')
    .insert([
      { 
        title: formData.title, 
        // Convert strings to Integers using Number() or parseInt()
        base_bpm: Number(formData.base_bpm) || 0, 
        target_bpm: Number(formData.target_bpm) || 0, 
        // Ensure empty strings for dates are sent as null if not required
        deadline: formData.deadline || null,
        youtube_link: formData.youtube_link,
        status: 'pending' 
      }
    ]);

  if (error) {
    console.error("Supabase Error Details:", error.message, error.details);
    setStatus('idle');
  } else {
    setFormData({ title: '', base_bpm: '', target_bpm: '', deadline: '', youtube_link: '' });
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  }
}

  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-[#2b2b2b] p-8 rounded-2xl border-2 border-[#3b3b3b] shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          🧵 <span className="tracking-tight uppercase">Tailor // Ticket</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Song Title</label>
            <input
              type="text" required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 focus:border-blue-500 outline-none"
              placeholder="e.g. Levitating"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Base BPM (Sample)</label>
              <input
                type="number"
                value={formData.base_bpm}
                onChange={(e) => setFormData({...formData, base_bpm: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 focus:border-blue-500 outline-none"
                placeholder="103"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target BPM (Studio)</label>
              <input
                type="number"
                value={formData.target_bpm}
                onChange={(e) => setFormData({...formData, target_bpm: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 focus:border-blue-500 outline-none"
                placeholder="128"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">YouTube Reference</label>
            <input
              type="url"
              value={formData.youtube_link}
              onChange={(e) => setFormData({...formData, youtube_link: e.target.value})}
              className="w-full bg-[#1a1a1a] border border-[#3b3b3b] rounded-lg p-3 focus:border-blue-500 outline-none"
              placeholder="Link to reference..."
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-[#1f538d] hover:bg-blue-600 py-3 rounded-lg font-bold transition-all mt-4"
          >
            {status === 'loading' ? 'SUBMITTING...' : 'CREATE TICKET'}
          </button>
        </form>
      </div>
    </main>
  );
}