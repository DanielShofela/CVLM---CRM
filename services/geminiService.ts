import { GoogleGenAI, Type } from "@google/genai";
import { CVParserResponse } from "../types";

export const parseCVRawText = async (rawText: string): Promise<CVParserResponse> => {
  // Utilisation directe de la clé de l'environnement comme requis par les instructions
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Clé API manquante dans l'environnement. Vérifiez la configuration système.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un assistant de recrutement expert. Analyse le texte suivant (CV, formulaire ou message) et extrait les informations structurées en JSON.
      
      RÈGLES D'EXTRACTION :
      1. extractedPromoCode : Le code de réduction ou code promo que la personne UTILISE pour sa demande actuelle.
      2. extractedOwnPromoCode : Le code personnel unique que la personne propose de partager (parrainage).
      3. extractedRequestDetails : Un résumé concis de ce que la personne demande (ex: "Refonte CV Design", "Lettre de motivation Luxe").
      4. Si une information est absente, laisse une chaîne vide.
      
      TEXTE À ANALYSER :
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            jobTitle: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            summary: { type: Type.STRING },
            extractedPromoCode: { type: Type.STRING },
            extractedOwnPromoCode: { type: Type.STRING },
            extractedRequestDetails: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    if (!text) throw new Error("Réponse de l'IA vide.");
    
    return JSON.parse(text) as CVParserResponse;
  } catch (error: any) {
    console.error("Erreur d'analyse Gemini:", error);
    throw new Error(error.message || "Échec de l'analyse IA. Vérifiez votre connexion.");
  }
};