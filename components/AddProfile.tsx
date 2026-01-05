import React, { useState } from 'react';
import { parseCVRawText } from '../services/geminiService';
import { CVParserResponse, Profile, CVRequest } from '../types';
import { Loader2, ArrowRight, Save, RotateCcw, AlertCircle, Ticket, UserPlus } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

interface AddProfileProps {
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}

const AddProfile: React.FC<AddProfileProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState<'INPUT' | 'REVIEW'>('INPUT');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<CVParserResponse | null>(null);

  const handleProcess = async () => {
    if (!rawText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const data = await parseCVRawText(rawText);
      setParsedData(data);
      setStep('REVIEW');
    } catch (err: any) {
      console.error("Détails de l'erreur d'analyse:", err);
      setError(`Échec : ${err.message || "Erreur de connexion ou clé API invalide."}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldChange = (field: keyof CVParserResponse, value: any) => {
    if (parsedData) {
      setParsedData({ ...parsedData, [field]: value });
    }
  };

  const handleSave = () => {
    if (parsedData) {
      const initialRequest: CVRequest = {
        id: generateId(),
        date: new Date().toISOString(),
        status: 'PENDING',
        promoCode: parsedData.extractedPromoCode || '',
        details: parsedData.extractedRequestDetails || 'Import Initial'
      };

      const newProfile: Profile = {
        id: generateId(),
        ...parsedData,
        jobTitle: parsedData.jobTitle || '',
        nationality: parsedData.nationality || '',
        birthYear: parsedData.birthYear || '',
        portfolioUrl: parsedData.portfolioUrl || '',
        certifications: parsedData.certifications || [],
        interests: parsedData.interests || [],
        references: parsedData.references || [],
        ownPromoCode: parsedData.extractedOwnPromoCode || '',
        createdAt: new Date().toISOString(),
        requests: [initialRequest],
        skills: parsedData.skills || [],
        experience: parsedData.experience || [],
        education: parsedData.education || []
      };
      onSave(newProfile);
    }
  };

  if (step === 'INPUT') {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Importer un Nouveau Prospect</h2>
          <p className="text-gray-500 mb-6">Collez le texte brut d'une soumission de formulaire ou d'un CV.</p>
          
          <div className="relative">
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Collez le contenu ici..."
              className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-start text-red-700 text-sm border border-red-100">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Une erreur est survenue</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleProcess}
              disabled={isProcessing || !rawText.trim()}
              className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                isProcessing || !rawText.trim()
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Traitement IA...
                </>
              ) : (
                <>
                  Analyser & Créer Commande
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vérifier Prospect & Demande</h2>
        </div>
        <button 
          onClick={() => setStep('INPUT')}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Recommencer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <h3 className="text-indigo-900 font-bold mb-4 flex items-center">
                   <Ticket className="h-5 w-5 mr-2" />
                   Commande & Promo Utilisée
                </h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-indigo-900 mb-1">Code Promo (Utilisé)</label>
                      <input
                       type="text"
                       value={parsedData?.extractedPromoCode || ''}
                       onChange={(e) => handleFieldChange('extractedPromoCode', e.target.value)}
                       className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-indigo-900 mb-1">Détails de la demande</label>
                      <input
                       type="text"
                       value={parsedData?.extractedRequestDetails || ''}
                       onChange={(e) => handleFieldChange('extractedRequestDetails', e.target.value)}
                       className="w-full px-3 py-2 border border-indigo-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                     />
                   </div>
                </div>
             </div>

             <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                <h3 className="text-purple-900 font-bold mb-4 flex items-center">
                   <UserPlus className="h-5 w-5 mr-2" />
                   Nouveau Code Parrainage
                </h3>
                <div>
                   <label className="block text-sm font-medium text-purple-900 mb-1">Code Personnel (à partager)</label>
                   <input
                    type="text"
                    value={parsedData?.extractedOwnPromoCode || ''}
                    onChange={(e) => handleFieldChange('extractedOwnPromoCode', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-md focus:ring-purple-500 focus:border-purple-500 font-bold"
                  />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
              <input
                type="text"
                value={parsedData?.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={parsedData?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="text"
                value={parsedData?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 -mx-6 -mb-6 border-t border-gray-200 flex justify-end space-x-3">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700">Annuler</button>
            <button onClick={handleSave} className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
              <Save className="h-4 w-4 mr-2" />
              Confirmer & Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProfile;