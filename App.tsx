import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProfileList from './components/ProfileList';
import AddProfile from './components/AddProfile';
import ProfileDetail from './components/ProfileDetail';
import { Profile, ViewState } from './types';

// Mock initial data if storage is empty
const MOCK_PROFILES: Profile[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('cv_profiles');
    return saved ? JSON.parse(saved) : MOCK_PROFILES;
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    localStorage.setItem('cv_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleSaveProfile = (newProfile: Profile) => {
    setProfiles(prev => [newProfile, ...prev]);
    setView('LIST');
  };

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setView('DETAIL');
  };

  // New handler to update a specific profile (e.g., when request status changes)
  const handleUpdateProfile = (updatedProfile: Profile) => {
      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
      setSelectedProfile(updatedProfile); // Keep the detailed view updated
  };

  const handleExportCSV = () => {
    // Define headers
    const headers = [
      "ID",
      "Nom Complet",
      "Email",
      "Téléphone",
      "Titre",
      "Localisation",
      "Code Parrainage",
      "Date Création",
      "Demandes (JSON)",
      "Expérience (JSON)",
      "Formation (JSON)",
      "Résumé"
    ];

    // Helper to escape CSV fields correctly (handling quotes and commas)
    const escape = (field: any) => {
      const stringified = field === undefined || field === null ? '' : String(field);
      if (stringified.includes('"') || stringified.includes(',') || stringified.includes('\n') || stringified.includes(';')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvRows = [
      headers.join(','), // Header row
      ...profiles.map(p => [
        p.id,
        p.fullName,
        p.email,
        p.phone,
        p.jobTitle,
        p.location,
        p.ownPromoCode,
        p.createdAt,
        JSON.stringify(p.requests || []),     // Complex data as JSON string
        JSON.stringify(p.experience || []),   // Complex data as JSON string
        JSON.stringify(p.education || []),    // Complex data as JSON string
        p.summary
      ].map(escape).join(','))
    ];

    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cvlm_crm_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (view) {
      case 'ADD':
        return (
          <AddProfile 
            onSave={handleSaveProfile} 
            onCancel={() => setView('LIST')} 
          />
        );
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
      default:
        return (
          <ProfileList 
            profiles={profiles} 
            onSelectProfile={handleSelectProfile} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar currentView={view} setView={setView} onExport={handleExportCSV} />
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