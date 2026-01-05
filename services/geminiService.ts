import { GoogleGenAI, Type } from "@google/genai";
import { CVParserResponse } from "../types";

export const parseCVRawText = async (rawText: string): Promise<CVParserResponse> => {
  try {
    // Initialize inside the function to prevent app crash on load if process.env is undefined in browser
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("La clé API (process.env.API_KEY) est manquante. Vérifiez la configuration Netlify.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extraire les informations suivantes de ce texte (qui peut être un CV ou une soumission de formulaire) dans un format JSON structuré.
      Si un champ n'est pas trouvé, utiliser une chaîne vide ou un tableau vide.
      
      Rechercher spécifiquement :
      1. "Code Promo Utilisé" (le code pour obtenir une réduction).
      2. "Code Parrainage" ou "Mon Code" (le code personnel du candidat s'il en a déjà un).
      3. Les détails de la demande (message, plan).

      Texte Brut :
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING, description: "Nom complet du candidat" },
            jobTitle: { type: Type.STRING, description: "Titre du poste actuel ou visé" },
            email: { type: Type.STRING, description: "Adresse email" },
            phone: { type: Type.STRING, description: "Numéro de téléphone" },
            location: { type: Type.STRING, description: "Ville, Pays ou localisation" },
            nationality: { type: Type.STRING, description: "Nationalité" },
            birthYear: { type: Type.STRING, description: "Année de naissance" },
            portfolioUrl: { type: Type.STRING, description: "Lien Portfolio ou LinkedIn" },
            summary: { type: Type.STRING, description: "Bref résumé professionnel" },
            extractedPromoCode: { type: Type.STRING, description: "Le code promo utilisé pour la commande (ex: BIENVENUE20)" },
            extractedOwnPromoCode: { type: Type.STRING, description: "Le code personnel du candidat (ex: ALEXPRO) s'il est mentionné explicitement" },
            extractedRequestDetails: { type: Type.STRING, description: "Le message, le nom du plan ou les détails de la demande issus du formulaire" },
            skills: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Liste des compétences" 
            },
            certifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste des certifications"
            },
            interests: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Loisirs ou intérêts"
            },
            references: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Références"
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  year: { type: Type.STRING }
                }
              }
            }
          },
          required: ["fullName", "email"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Aucune réponse de Gemini");
    
    return JSON.parse(text) as CVParserResponse;
  } catch (error) {
    console.error("Erreur lors de l'analyse du CV:", error);
    throw error;
  }
};