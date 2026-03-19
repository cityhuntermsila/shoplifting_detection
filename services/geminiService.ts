
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, Language } from "../types";

/**
 * Custom error class for API Quota issues
 */
export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaError";
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeFrames = async (base64Images: string[], lang: Language = 'ar', retries = 2): Promise<DetectionResult> => {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).API_KEY;
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey as string });

  const langPrompt = lang === 'ar'
    ? "يجب أن تكون إجابتك باللغة العربية حصراً في حقل 'reason' و 'label' و 'markers'."
    : "Your answer must be exclusively in English for the 'reason', 'label' and 'markers' fields.";

  const systemInstruction = `You are "Al-Muraqib" (The Guardian), a specialized AI for retail loss prevention and security surveillance.
    Mission: 
    1. Detect and track SPECIFIC theft attempts or shoplifting behaviors.
    2. Monitor for specific shoplifting indicators (Concealment, Staging, Loitering).
    3. MUST provide precise bounding boxes [ymin, xmin, ymax, xmax] for any suspicious person. Box coordinates must be integers scaled from 0 to 1000 (where [0,0] is top-left and [1000,1000] is bottom-right).
    
    Behavioral Analysis Guidelines:
    - CONCEALMENT: Putting items in pockets, under jackets, or into personal bags.
    - REPETITIVE HANDLING: Picking up and putting back the same item multiple times.
    - SURVEILLANCE AWARENESS: Looking for cameras or checking for staff presence before acting.
    - AREA LOITERING: Staying in high-value or blind-spot areas without intent to buy.
    - QUICK MOVEMENTS: Rapidly moving towards exits or shielding behavior.

    Temporal Context: 
    You are provided with a sequence of images (the "strip") taken at 0.2s intervals. 
    Analyze the movement and actions of people across these frames to detect suspicious patterns.

    Risk Classification: 
    - 'LOW': Normal shopping behavior or staff activity.
    - 'MEDIUM': Suspicious movements (frequent looking around, unusual grouping, hands in pockets for long periods).
    - 'HIGH': Active concealment, bypassing registers, or aggressive behavior.

    ${langPrompt}`;

  const prompt = lang === 'ar'
    ? `قم بتحليل هذه السلسلة من اللقطات الأمنية (المأخوذة بفارق 0.2 ثانية) بدقة. حدد أي محاولات سرقة أو سلوك مشبوه بمربع محيط ضيق كما يظهر في آخر لقطة. قم بتقييم مستوى الخطر (LOW, MEDIUM, HIGH) بناءً على تطور سلوكهم عبر الزمن. اشرح السبب بالتفصيل في حقل 'reason' في حال وجود اشتباه.`
    : `Perform a detailed security analysis of this sequence of frames (taken at 0.2s intervals). Identify any theft attempts or suspicious behavior with a tight bounding box as seen in the final frame. Assign a riskLevel (LOW, MEDIUM, HIGH) based on how their behavior evolves over the sequence. If any activity is suspicious, provide a detailed explanation in the 'reason' field.`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              ...base64Images.map(img => ({
                inlineData: {
                  mimeType: "image/jpeg",
                  data: img.split(',')[1] || img
                }
              }))
            ]
          }
        ],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isTheft: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, description: "Overall highest risk level in the frame" },
              reason: { type: Type.STRING, description: "Detailed summary of detections" },
              markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              suspects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING, description: "Role: e.g. Customer, Suspicious, Staff" },
                    riskLevel: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
                    box: {
                      type: Type.OBJECT,
                      properties: {
                        ymin: { type: Type.NUMBER },
                        xmin: { type: Type.NUMBER },
                        ymax: { type: Type.NUMBER },
                        xmax: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            },
            required: ["isTheft", "confidence", "riskLevel", "reason"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      const result = JSON.parse(jsonStr.trim());

      return {
        ...result,
        timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US'),
        screenshot: base64Images[base64Images.length - 1] // Return the last frame as the main reference
      };
    } catch (error: any) {
      const errorMsg = error?.message || "";
      const isQuotaError = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED");

      if (isQuotaError) {
        if (attempt < retries) {
          // Exponential backoff: 2s, 4s...
          await sleep(Math.pow(2, attempt + 1) * 1000);
          continue;
        }
        throw new QuotaError(lang === 'ar' ? "لقد تجاوزت حصة الاستخدام المسموح بها. يرجى الانتظار قليلاً أو مراجعة حسابك." : "Quota exceeded. Please wait a moment or check your plan.");
      }

      if (attempt === retries) {
        console.error("Gemini Analysis Final Error:", error);
        throw error;
      }

      await sleep(1000);
    }
  }

  throw new Error("Unexpected error in analysis flow");
};
