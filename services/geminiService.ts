import { GoogleGenAI, Type } from "@google/genai";
import { CVParserResponse } from "../types";

export const parseCVRawText = async (rawText: string): Promise<CVParserResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Clé API absente de l'environnement. Veuillez la configurer via le bouton 'Configurer'.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyse ce texte de CV ou formulaire et retourne un JSON structuré. 
      Extrais spécifiquement : 
      - extractedPromoCode: le code promo UTILISÉ pour cette demande.
      - extractedOwnPromoCode: le code personnel du candidat s'il en mentionne un pour parrainage.
      - extractedRequestDetails: un résumé de sa demande actuelle.
      
      Texte : ${rawText}`,
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
    if (!text) throw new Error("L'IA n'a retourné aucun contenu.");
    return JSON.parse(text) as CVParserResponse;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Votre clé API est invalide. Veuillez en sélectionner une autre.");
    }
    throw error;
  }
};