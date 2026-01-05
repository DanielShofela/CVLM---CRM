import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProfileList from './components/ProfileList';
import AddProfile from './components/AddProfile';
import ProfileDetail from './components/ProfileDetail';
import { Profile, ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('cv_profiles_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    localStorage.setItem('cv_profiles_v2', JSON.stringify(profiles));
  }, [profiles]);

  const handleSaveProfile = (newProfile: Profile) => {
    setProfiles(prev => [newProfile, ...prev]);
    setView('LIST');
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setView('DETAIL');
  };

  const handleUpdateProfile = (updatedProfile: Profile) => {
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    setSelectedProfile(updatedProfile);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Nom Complet", "Email", "Téléphone", "Titre", "Code Parrainage", "Date"];
    const rows = profiles.map(p => [
      p.id, 
      p.fullName, 
      p.email, 
      p.phone, 
      p.jobTitle, 
      p.ownPromoCode, 
      new Date(p.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `crm_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentView={view} setView={setView} onExport={handleExportCSV} />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {view === 'ADD' && (
          <AddProfile onSave={handleSaveProfile} onCancel={() => setView('LIST')} />
        )}
        
        {view === 'DETAIL' && selectedProfile && (
          <ProfileDetail 
            profile={selectedProfile} 
            allProfiles={profiles}
            onBack={() => setView('LIST')} 
            onUpdateProfile={handleUpdateProfile}
            onSelectProfile={handleSelectProfile}
          />
        )}
        
        {view === 'LIST' && (
          <ProfileList profiles={profiles} onSelectProfile={handleSelectProfile} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} CVLM Intelligent CRM. Analyse propulsée par Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;