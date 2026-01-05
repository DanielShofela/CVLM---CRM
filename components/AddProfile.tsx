import React, { useState } from 'react';
import { parseCVRawText } from '../services/geminiService';
import { CVParserResponse, Profile, CVRequest } from '../types';
import { Loader2, Sparkles, ArrowRight, Save, RotateCcw, AlertCircle, ClipboardCheck, Info } from 'lucide-react';

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
      setError(err.message);
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
        id: 'REQ-' + generateId().substring(0, 5).toUpperCase(),
        date: new Date().toISOString(),
        status: 'PENDING',
        promoCode: parsedData.extractedPromoCode || '',
        details: parsedData.extractedRequestDetails || 'Import manuel'
      };

      const newProfile: Profile = {
        id: 'PR-' + generateId().substring(0, 5).toUpperCase(),
        ...parsedData,
        jobTitle: parsedData.jobTitle || 'Sans titre',
        nationality: '',
        birthYear: '',
        portfolioUrl: '',
        certifications: [],
        interests: [],
        references: [],
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
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nouvel Import IA</h2>
                <p className="text-slate-500">Collez le contenu pour une extraction automatique.</p>
              </div>
            </div>
            
            <div className="relative group">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Exemple : Nom: Jean Dupont, Email: jean@mail.com, Demande: Je souhaite un CV design avec le code promo REDUC20..."
                className="w-full h-80 p-5 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all resize-none font-medium text-slate-700 bg-slate-50/50"
              />
              <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-medium">
                {rawText.length} caractères
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center text-red-700 animate-in shake duration-300">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 font-bold transition-colors">
                Annuler
              </button>
              <button
                onClick={handleProcess}
                disabled={isProcessing || !rawText.trim()}
                className={`flex items-center px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  isProcessing || !rawText.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    Lancer l'Analyse IA
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Vérification des données</h2>
        <button onClick={() => setStep('INPUT')} className="flex items-center text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Résumé de l'analyse */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Info className="h-5 w-5 mr-2 text-indigo-500" />
              Informations Personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom Complet</label>
                <input
                  type="text"
                  value={parsedData?.fullName || ''}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={parsedData?.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Téléphone</label>
                <input
                  type="text"
                  value={parsedData?.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <ClipboardCheck className="h-5 w-5 mr-2 text-green-500" />
              Demande Extraite
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Objet de la demande</label>
                <textarea
                  value={parsedData?.extractedRequestDetails || ''}
                  onChange={(e) => handleFieldChange('extractedRequestDetails', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Codes Promo */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="font-bold flex items-center mb-6">
              <Sparkles className="h-5 w-5 mr-2" />
              Codes Promo
            </h3>
            <div className="space-y-4">
              <div className="bg-indigo-500/30 p-4 rounded-xl border border-indigo-400/30">
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Code Utilisé</label>
                <input
                  type="text"
                  value={parsedData?.extractedPromoCode || ''}
                  onChange={(e) => handleFieldChange('extractedPromoCode', e.target.value)}
                  className="w-full bg-transparent border-b border-indigo-300 font-mono font-bold text-xl uppercase outline-none focus:border-white transition-colors"
                  placeholder="AUCUN"
                />
              </div>
              <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                <label className="block text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Code Parrainage Client</label>
                <input
                  type="text"
                  value={parsedData?.extractedOwnPromoCode || ''}
                  onChange={(e) => handleFieldChange('extractedOwnPromoCode', e.target.value)}
                  className="w-full bg-transparent border-b border-indigo-300 font-mono font-bold text-xl uppercase outline-none focus:border-white transition-colors"
                  placeholder="À DÉFINIR"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
          >
            <Save className="h-6 w-6 mr-3" />
            Enregistrer le Prospect
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProfile;