
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Simulates analyzing an uploaded document (title/abstract) to generate metadata
 */
export const extractThesisMetadata = async (title: string, abstract: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an academic librarian. Analyze this thesis title and abstract to suggest 5 relevant keywords and a specific academic department.
      Title: ${title}
      Abstract: ${abstract}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDepartment: { type: Type.STRING },
            academicLevel: { type: Type.STRING, description: "Masters, PhD, or Undergraduate" }
          },
          required: ["keywords", "suggestedDepartment"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Metadata Extraction Error:", error);
    return null;
  }
};

/**
 * Summarizes the thesis content for a general academic audience
 */
export const summarizeThesis = async (thesis: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise, professional 2-sentence executive summary of the following thesis abstract. Do not use conversational filler.
      Title: ${thesis.title}
      Abstract: ${thesis.abstract}`,
    });
    return response.text || "Summary analysis failed.";
  } catch (error) {
    console.error("Gemini Summarization Error:", error);
    return "Summary unavailable.";
  }
};

/**
 * Analyzes a thesis proposal to provide structured academic feedback and research questions
 */
export const analyzeThesisIdea = async (title: string, abstract: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an expert academic advisor. Analyze the following thesis proposal (title and abstract) and provide structured feedback.
      Title: ${title}
      Abstract: ${abstract}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING, description: "General constructive feedback" },
            researchQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 core research questions" },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key literature areas" },
            suggestions: { type: Type.STRING, description: "Specific improvements" }
          },
          required: ["feedback", "researchQuestions", "keywords"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

/**
 * Suggests refined variations of a thesis title for better academic rigor
 */
export const refineTitle = async (title: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 5 professional and academically rigorous title variations for the following thesis title: "${title}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Title Refinement Error:", error);
    return [];
  }
};
