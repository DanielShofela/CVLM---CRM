import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProfileList from './components/ProfileList';
import AddProfile from './components/AddProfile';
import ProfileDetail from './components/ProfileDetail';
import { Profile, ViewState } from './types';
import { Key, ExternalLink, AlertTriangle } from 'lucide-react';

// Mock initial data
const MOCK_PROFILES: Profile[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('cv_profiles');
      return saved ? JSON.parse(saved) : MOCK_PROFILES;
    } catch (e) {
      console.error("Erreur de lecture du localStorage", e);
      return MOCK_PROFILES;
    }
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [needsKey, setNeedsKey] = useState(false);

  // Check for API Key selection on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && !process.env.API_KEY) {
          setNeedsKey(true);
        }
      } else if (!process.env.API_KEY) {
        // Fallback if not in AI Studio environment but key is missing
        setNeedsKey(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cv_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
    }
  }, [profiles]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
      // After selection, we assume the key is now available via process.env.API_KEY
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
    const headers = ["ID", "Nom Complet", "Email", "Téléphone", "Titre", "Localisation", "Code Parrainage", "Date Création", "Demandes (JSON)", "Expérience (JSON)", "Formation (JSON)", "Résumé"];
    const escape = (field: any) => {
      const s = field === undefined || field === null ? '' : String(field);
      return (s.includes('"') || s.includes(',') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csvRows = [
      headers.join(','),
      ...profiles.map(p => [
        p.id, p.fullName, p.email, p.phone, p.jobTitle, p.location, p.ownPromoCode, p.createdAt,
        JSON.stringify(p.requests || []), JSON.stringify(p.experience || []), JSON.stringify(p.education || []),
        p.summary
      ].map(escape).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cvlm_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (needsKey) {
      return (
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-2xl shadow-xl border border-indigo-100">
          <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Requise</h2>
          <p className="text-gray-600 mb-8">
            Pour utiliser l'IA de CVLM, vous devez sélectionner une clé API valide. 
            Les clés doivent provenir d'un projet Google Cloud avec facturation activée.
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
          >
            Sélectionner ma clé API
          </button>
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center text-sm text-gray-400 hover:text-indigo-600"
          >
            Documentation sur la facturation <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      );
    }

    switch (view) {
      case 'ADD': return <AddProfile onSave={handleSaveProfile} onCancel={() => setView('LIST')} />;
      case 'DETAIL':
        if (!selectedProfile) return <ProfileList profiles={profiles} onSelectProfile={handleSelectProfile} />;
        return (
          <ProfileDetail 
            profile={selectedProfile} 
            allProfiles={profiles}
            onBack={() => setView('LIST')} 
            onUpdateProfile={handleUpdateProfile}
            onSelectProfile={handleSelectProfile}
          />
        );
      case 'LIST':
      default: return <ProfileList profiles={profiles} onSelectProfile={handleSelectProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar currentView={view} setView={setView} onExport={handleExportCSV} />
      
      {/* Alert Banner if key is potentially missing but not strictly forced */}
      {!needsKey && !process.env.API_KEY && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-amber-800 text-xs font-medium flex items-center justify-center">
          <AlertTriangle className="h-3 w-3 mr-2" />
          Attention : Aucune clé API détectée. Les fonctions d'analyse peuvent échouer.
          <button onClick={() => setNeedsKey(true)} className="ml-2 underline font-bold">Configurer</button>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CVLM - CRM. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;