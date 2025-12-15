import React, { useState } from 'react';
import { Profile } from '../types';
import { Search, MapPin, Briefcase, ChevronRight, Ticket, Clock } from 'lucide-react';

interface ProfileListProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({ profiles, onSelectProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProfiles = profiles.filter(profile => 
    profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.requests.some(req => req.promoCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En Attente';
      case 'IN_PROGRESS': return 'En Cours';
      case 'DELIVERED': return 'Livré';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prospects & Demandes</h1>
          <p className="text-gray-500 mt-1">Gérez les demandes de CV et le pipeline des prospects.</p>
        </div>
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            placeholder="Rechercher nom, email, code promo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun prospect trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Essayez de modifier vos termes de recherche.' : 'Commencez par ajouter un nouveau prospect.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            // Get latest request status
            const latestRequest = profile.requests && profile.requests.length > 0 
              ? profile.requests[0] // Assuming sorted or first is newest, logic can vary
              : null;

            return (
              <div 
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 overflow-hidden cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {profile.fullName}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {profile.location || 'Inconnu'}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {profile.fullName.charAt(0)}
                    </div>
                  </div>

                  {/* Active Request Indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Demandes Actives</h4>
                       <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                         {profile.requests?.length || 0} Total
                       </span>
                    </div>
                    
                    {latestRequest ? (
                      <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between">
                         <div className="flex items-center text-sm text-gray-700 truncate mr-2">
                           <Ticket className="h-4 w-4 mr-2 text-gray-400" />
                           <span className="truncate">{latestRequest.details || 'Demande générale'}</span>
                         </div>
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm ${getStatusColor(latestRequest.status)}`}>
                           {getStatusLabel(latestRequest.status)}
                         </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aucune demande active</p>
                    )}
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Dernière : {latestRequest ? new Date(latestRequest.date).toLocaleDateString() : 'Jamais'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileList;