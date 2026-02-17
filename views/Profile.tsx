
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zen_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Arjun Mehta',
      bio: 'Pursuing Physics with a focus on Quantum Mechanics. Finding peace in the process.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
      focusTime: 1420,
      streak: 12,
      chaptersCompleted: 8
    };
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('zen_notifications_enabled') === 'true';
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);

  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem('zen_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('zen_notifications_enabled', String(notificationsEnabled));
  }, [notificationsEnabled]);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      } else {
        alert("Please enable notifications in your browser settings to receive Zen motivation.");
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !tempImage) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = tempImage;
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;
      
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, x, y, size, size, 0, 0, 400, 400);
      
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setProfile(prev => ({ ...prev, avatar: croppedDataUrl }));
      setShowCropModal(false);
      setTempImage(null);
    };
  };

  const saveProfile = () => {
    setProfile(prev => ({ ...prev, name: editName, bio: editBio }));
    setIsEditing(false);
  };

  return (
    <div className="p-6 pb-40">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Your Sanctuary</h1>
        <button className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden mb-10">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/10 to-primary/30 -z-10"></div>
        
        <div className="relative group">
          <div className="size-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 mb-4 transition-transform group-hover:scale-105">
            <img src={profile.avatar} alt="Profile" className="size-full object-cover" />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 right-0 size-10 rounded-full bg-zen-dark text-white flex items-center justify-center border-4 border-white shadow-lg transition-transform hover:scale-110 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        {isEditing ? (
          <div className="w-full mt-4 space-y-4">
            <input 
              className="w-full text-center text-2xl font-bold text-gray-800 bg-transparent border-0 border-b-2 border-primary focus:ring-0 p-0"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Your Name"
            />
            <textarea 
              className="w-full text-center text-sm text-gray-500 bg-transparent border-0 border-b border-gray-100 focus:ring-0 p-0 resize-none"
              value={editBio}
              onChange={e => setEditBio(e.target.value)}
              placeholder="Tell us about your focus..."
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-xl text-gray-400 text-sm font-bold bg-gray-50">Cancel</button>
              <button onClick={saveProfile} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">Save</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{profile.name}</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed px-4">{profile.bio}</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-6 text-[10px] font-bold tracking-widest uppercase text-primary-dark bg-primary/10 px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Notifications Toggle */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">notifications_active</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">12 PM Motivation</p>
            <p className="text-[10px] text-gray-400 font-medium">Daily focus spark when you return.</p>
          </div>
        </div>
        <button 
          onClick={handleToggleNotifications}
          className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? 'bg-primary' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 size-4 bg-white rounded-full shadow-sm transition-all ${notificationsEnabled ? 'left-7' : 'left-1'}`}></div>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
          <span className="text-2xl font-bold text-gray-800">{Math.round(profile.focusTime / 60)}h</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">Focus</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
          <span className="text-2xl font-bold text-gray-800">{profile.streak}</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">Streak</span>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col items-center shadow-sm">
          <span className="text-2xl font-bold text-gray-800">{profile.chaptersCompleted}</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">Mastery</span>
        </div>
      </div>

      {/* Achievements / Mood Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-800 tracking-[0.2em] uppercase px-2 mb-2">Focus Activity</h3>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-10 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Productivity peaks</p>
              <p className="text-xs text-gray-400">Afternoon is your golden hour</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-20 gap-1 px-2">
            {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between mt-3 px-2 text-[10px] font-bold text-gray-300">
            <span>MON</span>
            <span>SUN</span>
          </div>
        </div>
      </div>

      {showCropModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6">Crop Image</h3>
            <div className="relative size-64 bg-gray-100 rounded-full overflow-hidden border-4 border-primary">
              {tempImage && <img src={tempImage} alt="To Crop" className="size-full object-cover opacity-80" />}
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="size-full border-4 border-dashed border-white/50 rounded-full"></div>
              </div>
            </div>
            <div className="flex gap-4 w-full mt-10">
              <button onClick={() => setShowCropModal(false)} className="flex-1 py-4 text-gray-400 font-bold">Cancel</button>
              <button onClick={handleCrop} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30">Set</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
