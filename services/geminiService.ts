import { GoogleGenAI, Type } from "@google/genai";
import { CVParserResponse } from "../types";

export const parseCVRawText = async (rawText: string): Promise<CVParserResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Clé API manquante (process.env.API_KEY).");
    }
    
    // Initialisation d'une nouvelle instance à chaque appel pour garantir la fraîcheur de la clé
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tu es un expert en recrutement. Analyse ce texte (CV ou formulaire) et extrait les données en JSON.
      
      Règles strictes :
      1. Si "Code Promo" est mentionné pour cette commande, mets-le dans extractedPromoCode.
      2. Si le candidat mentionne son propre code de parrainage à partager, mets-le dans extractedOwnPromoCode.
      3. Résume la demande dans extractedRequestDetails.
      
      Texte à analyser :
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
            nationality: { type: Type.STRING },
            birthYear: { type: Type.STRING },
            portfolioUrl: { type: Type.STRING },
            summary: { type: Type.STRING },
            extractedPromoCode: { type: Type.STRING },
            extractedOwnPromoCode: { type: Type.STRING },
            extractedRequestDetails: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            interests: { type: Type.ARRAY, items: { type: Type.STRING } },
            references: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["role", "company"]
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
                },
                required: ["institution"]
              }
            }
          },
          required: ["fullName", "email"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA.");
    
    return JSON.parse(text) as CVParserResponse;
  } catch (error: any) {
    console.error("Erreur Gemini Service:", error);
    throw error;
  }
};