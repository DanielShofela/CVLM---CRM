import React from 'react';
import { Briefcase, UserPlus, Users, Download } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onExport: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onExport }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => setView('LIST')}>
            <Briefcase className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">CVLM - CRM</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setView('LIST')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'LIST' 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Prospects</span>
            </button>
            <button
              onClick={() => setView('ADD')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'ADD' 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter Prospect</span>
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <button
              onClick={onExport}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors"
              title="Télécharger toutes les données en CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;