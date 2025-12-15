import React, { useState } from 'react';
import { Profile, RequestStatus, CVRequest } from '../types';
import { Mail, Phone, MapPin, Calendar, Building, GraduationCap, ArrowLeft, Download, Globe, Award, Heart, Users, User, Ticket, CheckCircle2, Clock, AlertCircle, BarChart3, Tag, Copy, ExternalLink, Link as LinkIcon, Edit2, Save, X } from 'lucide-react';

interface ProfileDetailProps {
  profile: Profile;
  allProfiles: Profile[];
  onBack: () => void;
  onUpdateProfile: (updatedProfile: Profile) => void;
  onSelectProfile: (profile: Profile) => void;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ profile, allProfiles, onBack, onUpdateProfile, onSelectProfile }) => {
  // State for editing Own Promo Code
  const [isEditingOwnCode, setIsEditingOwnCode] = useState(false);
  const [tempOwnCode, setTempOwnCode] = useState('');

  // State for editing Request Promo Code
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [tempRequestCode, setTempRequestCode] = useState('');

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    const updatedRequests = profile.requests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    );
    onUpdateProfile({ ...profile, requests: updatedRequests });
  };

  // --- Handlers for Own Code Editing ---
  const startEditingOwnCode = () => {
    setTempOwnCode(profile.ownPromoCode || '');
    setIsEditingOwnCode(true);
  };

  const saveOwnCode = () => {
    onUpdateProfile({ ...profile, ownPromoCode: tempOwnCode });
    setIsEditingOwnCode(false);
  };

  const cancelEditingOwnCode = () => {
    setIsEditingOwnCode(false);
    setTempOwnCode('');
  };

  // --- Handlers for Request Promo Code Editing ---
  const startEditingRequestCode = (req: CVRequest, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the row
    setTempRequestCode(req.promoCode || '');
    setEditingRequestId(req.id);
  };

  const saveRequestCode = (reqId: string) => {
    const updatedRequests = profile.requests.map(r => 
        r.id === reqId ? { ...r, promoCode: tempRequestCode } : r
    );
    onUpdateProfile({ ...profile, requests: updatedRequests });
    setEditingRequestId(null);
  };

  const cancelEditingRequestCode = () => {
    setEditingRequestId(null);
    setTempRequestCode('');
  };


  // Calculate how many times THIS profile's own code was used by OTHERS
  const getReferralUsageCount = () => {
    if (!profile.ownPromoCode) return 0;
    const myCode = profile.ownPromoCode.trim().toLowerCase();
    let count = 0;
    
    allProfiles.forEach(p => {
      if (p.requests) {
        p.requests.forEach(r => {
          if (r.promoCode && r.promoCode.trim().toLowerCase() === myCode) {
            count++;
          }
        });
      }
    });
    return count;
  };

  // Find the profile object that owns a specific promo code
  const getPromoCodeOwner = (code: string) => {
    if (!code) return null;
    const normalizedCode = code.trim().toLowerCase();
    return allProfiles.find(p => p.ownPromoCode && p.ownPromoCode.trim().toLowerCase() === normalizedCode);
  };

  const referralCount = getReferralUsageCount();

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> En Attente</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Loader2Icon className="w-3 h-3 mr-1"/> En Cours</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1"/> Livré</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1"/> Annulé</span>;
      default: return null;
    }
  };

  // Helper icon for statuses inside the switch logic simplified above
  const Loader2Icon = ({className}:{className?:string}) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Retour au tableau de bord
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Personal Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-center">
                <div className="h-24 w-24 rounded-full bg-white mx-auto flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-indigo-200 shadow-md">
                   {profile.fullName.charAt(0)}
                </div>
                <h1 className="text-xl font-bold text-white mt-4">{profile.fullName}</h1>
                <p className="text-indigo-100 text-sm mt-1">{profile.jobTitle || 'Prospect'}</p>
             </div>
             
             <div className="p-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <a href={`mailto:${profile.email}`} className="hover:text-indigo-600 truncate">{profile.email}</a>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{profile.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{profile.location || 'N/A'}</span>
                </div>
             </div>
          </div>

          {/* REFERRAL CARD */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm border border-purple-100 p-6">
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-sm font-bold text-purple-900 flex items-center">
                 <Tag className="h-4 w-4 mr-2 text-purple-600" />
                 Espace Parrainage
               </h3>
               {!isEditingOwnCode && (
                 <button 
                   onClick={startEditingOwnCode}
                   className="text-purple-400 hover:text-purple-600 transition-colors p-1 rounded-full hover:bg-purple-100"
                   title="Modifier le code de parrainage"
                 >
                   <Edit2 className="h-4 w-4" />
                 </button>
               )}
             </div>

             <div className="bg-white border border-purple-100 rounded-lg p-4 text-center mb-4 shadow-sm relative group">
                {isEditingOwnCode ? (
                  <div className="flex items-center justify-between space-x-2">
                    <input
                      type="text"
                      value={tempOwnCode}
                      onChange={(e) => setTempOwnCode(e.target.value)}
                      placeholder="CODE"
                      className="w-full text-center font-mono font-bold text-purple-700 uppercase border-b-2 border-purple-300 focus:border-purple-600 outline-none bg-transparent"
                      autoFocus
                    />
                    <div className="flex space-x-1">
                      <button onClick={saveOwnCode} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="h-4 w-4"/></button>
                      <button onClick={cancelEditingOwnCode} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="h-4 w-4"/></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 mb-1">Code Personnel</p>
                    <div className="text-xl font-mono font-bold text-purple-700 tracking-wider">
                      {profile.ownPromoCode || 'AUCUN'}
                    </div>
                  </>
                )}
             </div>

             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Utilisations :</span>
                <span className="font-bold text-gray-900 bg-purple-100 px-2 py-0.5 rounded-full">
                  {referralCount} fois
                </span>
             </div>
             <p className="text-xs text-gray-400 mt-3 text-center">
               Nombre de fois que ce code a été utilisé par des commandes.
             </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
             <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
               <Ticket className="h-4 w-4 mr-2 text-indigo-500" />
               Statistiques Demandes
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                   <div className="text-2xl font-bold text-indigo-600">{profile.requests?.length || 0}</div>
                   <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                   <div className="text-2xl font-bold text-green-600">
                     {profile.requests?.filter(r => r.status === 'DELIVERED').length || 0}
                   </div>
                   <div className="text-xs text-gray-500">Livrées</div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pipeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Requests Pipeline "The Parent Bubble" */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                   <Ticket className="h-5 w-5 mr-2 text-indigo-600" />
                   Historique des Commandes
                </h2>
             </div>
             <div className="p-0">
                {(profile.requests || []).length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Aucune demande enregistrée.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                     {profile.requests.map((req) => {
                        const codeOwner = getPromoCodeOwner(req.promoCode);
                        const isEditingThisRequest = editingRequestId === req.id;

                        return (
                          <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors group">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                <div>
                                   <div className="flex items-center space-x-2">
                                      <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{req.id.substring(0,6)}</span>
                                      <span className="text-xs text-gray-400">{new Date(req.date).toLocaleString()}</span>
                                   </div>
                                   <h4 className="font-bold text-gray-900 mt-1">{req.details || 'Demande de CV générale'}</h4>
                                   
                                   {/* Display Code USED for this request */}
                                   <div className="flex items-center mt-2 space-x-2 h-8">
                                     {isEditingThisRequest ? (
                                       <div className="flex items-center space-x-1 animate-in fade-in duration-200">
                                         <input
                                           type="text"
                                           value={tempRequestCode}
                                           onChange={(e) => setTempRequestCode(e.target.value)}
                                           placeholder="Code Promo"
                                           className="px-2 py-0.5 text-xs border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none w-32"
                                           autoFocus
                                           onClick={(e) => e.stopPropagation()}
                                         />
                                         <button onClick={() => saveRequestCode(req.id)} className="p-0.5 text-green-600 hover:bg-green-100 rounded"><Save className="h-4 w-4"/></button>
                                         <button onClick={cancelEditingRequestCode} className="p-0.5 text-red-600 hover:bg-red-100 rounded"><X className="h-4 w-4"/></button>
                                       </div>
                                     ) : (
                                       <div className="flex items-center group/code">
                                          {req.promoCode ? (
                                            <div className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                <span className="mr-1">Code Utilisé :</span>
                                                {codeOwner ? (
                                                    <button
                                                      onClick={() => onSelectProfile(codeOwner)}
                                                      className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center transition-colors"
                                                      title={`Aller au profil de ${codeOwner.fullName}`}
                                                    >
                                                      {req.promoCode}
                                                      <ExternalLink className="w-3 h-3 ml-1" />
                                                    </button>
                                                ) : (
                                                    <span className="font-mono font-bold">{req.promoCode}</span>
                                                )}
                                            </div>
                                          ) : (
                                            <span className="text-xs text-gray-400 italic flex items-center">
                                              Aucun code promo
                                            </span>
                                          )}
                                          
                                          {/* Edit Button for Used Code */}
                                          <button 
                                            onClick={(e) => startEditingRequestCode(req, e)}
                                            className="ml-2 text-gray-300 hover:text-indigo-500 opacity-0 group-hover/code:opacity-100 group-hover:opacity-100 transition-all p-1"
                                            title="Modifier le code utilisé"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </button>
                                       </div>
                                     )}
                                   </div>

                                </div>
                                <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                                   {getStatusBadge(req.status)}
                                </div>
                             </div>
                             
                             {/* Status Controls */}
                             <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                                <span className="text-xs font-medium text-gray-500 mr-2">Changer le statut :</span>
                                <button onClick={() => handleStatusChange(req.id, 'PENDING')} className={`px-2 py-1 text-xs rounded border ${req.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>En Attente</button>
                                <button onClick={() => handleStatusChange(req.id, 'IN_PROGRESS')} className={`px-2 py-1 text-xs rounded border ${req.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>En Cours</button>
                                <button onClick={() => handleStatusChange(req.id, 'DELIVERED')} className={`px-2 py-1 text-xs rounded border ${req.status === 'DELIVERED' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Livré</button>
                             </div>
                          </div>
                        );
                     })}
                  </div>
                )}
             </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
               <User className="h-5 w-5 mr-2 text-indigo-600" />
               Profil Professionnel
            </h2>
            
            <section className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Résumé</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.summary || 'Aucun résumé.'}</p>
            </section>

            <section className="mb-8">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Expérience</h3>
               <div className="space-y-6">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-indigo-100">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                      <h4 className="text-md font-bold text-gray-800">{exp.role}</h4>
                      <span className="text-xs text-gray-500 font-medium">{exp.duration}</span>
                    </div>
                    <div className="text-sm text-indigo-600 font-medium mb-2">{exp.company}</div>
                    <p className="text-sm text-gray-600">{exp.description}</p>
                  </div>
                ))}
                {profile.experience.length === 0 && <p className="text-sm text-gray-500 italic">Aucune expérience.</p>}
               </div>
            </section>

            <section>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Formation</h3>
               <div className="space-y-4">
                 {profile.education.map((edu, idx) => (
                   <div key={idx}>
                     <p className="text-sm font-bold text-gray-900">{edu.institution}</p>
                     <p className="text-xs text-gray-600">{edu.degree} - {edu.year}</p>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;