import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProfileList from './components/ProfileList';
import AddProfile from './components/AddProfile';
import ProfileDetail from './components/ProfileDetail';
import { Profile, ViewState } from './types';
import { Key, AlertTriangle, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('cv_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [needsKeySelection, setNeedsKeySelection] = useState(false);

  // Vérification de la clé API au démarrage
  useEffect(() => {
    const checkKeyStatus = async () => {
      // Si la clé n'est pas déjà injectée, on vérifie via le bridge aistudio
      if (!process.env.API_KEY && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setNeedsKeySelection(true);
        }
      }
    };
    checkKeyStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem('cv_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsKeySelection(false);
      // On force un petit délai symbolique pour que process.env se mette à jour
      window.location.reload(); 
    }
  };

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
    const headers = ["ID", "Nom", "Email", "Tel", "Titre", "Code Parrainage", "Date"];
    const rows = profiles.map(p => [p.id, p.fullName, p.email, p.phone, p.jobTitle, p.ownPromoCode, p.createdAt]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_cvlm_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (needsKeySelection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-indigo-100 p-8 text-center">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Clé API Requise</h2>
          <p className="text-gray-600 mb-8">
            Pour analyser vos CV avec l'IA, vous devez sélectionner une clé API Gemini valide.
          </p>
          <button
            onClick={handleOpenKeySelector}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            Sélectionner ma Clé API
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Note: Utilisez une clé liée à un projet avec facturation activée.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentView={view} setView={setView} onExport={handleExportCSV} />
      
      {!process.env.API_KEY && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-amber-800 text-xs flex items-center justify-center">
          <AlertTriangle className="h-3 w-3 mr-2" />
          Aucune clé API active détectée. 
          <button onClick={() => setNeedsKeySelection(true)} className="ml-2 underline font-bold">Configurer</button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {view === 'ADD' && <AddProfile onSave={handleSaveProfile} onCancel={() => setView('LIST')} />}
        {view === 'DETAIL' && selectedProfile && (
          <ProfileDetail 
            profile={selectedProfile} 
            allProfiles={profiles}
            onBack={() => setView('LIST')} 
            onUpdateProfile={handleUpdateProfile}
            onSelectProfile={handleSelectProfile}
          />
        )}
        {view === 'LIST' && <ProfileList profiles={profiles} onSelectProfile={handleSelectProfile} />}
      </main>
    </div>
  );
};

export default App;