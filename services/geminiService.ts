
import { GoogleGenAI, Type } from "@google/genai";
import { Merchant, RouteInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface DiscoveredPartner {
  name: string;
  category: string;
  address: string;
  googleMapsUri: string;
  contactPotential: string;
  strategicValue: string;
}

export const scanPakurForPartners = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a deep scan for real commercial entities in Pakur, Jharkhand. Find stores matching: ${query}. 
      Include pharmacies, general stores, and bakeries. Focus on Harindanga, Railway Colony, and Main Market areas. 
      For each, provide a brief strategic assessment for 15-minute delivery partnership.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 24.7861,
              longitude: 87.8512
            }
          }
        }
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const text = response.text || "";

    const partners: DiscoveredPartner[] = groundingChunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        name: chunk.maps.title,
        category: "Daily Needs", 
        address: "Pakur, Jharkhand",
        googleMapsUri: chunk.maps.uri,
        contactPotential: "Check Google Business Profile linked below",
        strategicValue: "Identified as a high-visibility commercial node."
      }));

    return { narrative: text, partners };
  } catch (error) {
    console.error("Discovery error:", error);
    return { narrative: "Scanning service unavailable.", partners: [] };
  }
};

export const getRouteLogistics = async (merchantName: string, address: string): Promise<RouteInfo> => {
  const prompt = `Calculate delivery feasibility for a quick commerce hub at ${merchantName}, ${address}, Pakur. 
  Estimate distance to the nearest residential hub, travel time in local Pakur traffic, and provide a 1-sentence logistics feasibility assessment.
  Return JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distanceKm: { type: Type.NUMBER },
            estimatedTimeMins: { type: Type.NUMBER },
            trafficStatus: { type: Type.STRING },
            feasibility: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            notes: { type: Type.STRING }
          },
          required: ["distanceKm", "estimatedTimeMins", "trafficStatus", "feasibility", "notes"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    return {
      distanceKm: 2.5,
      estimatedTimeMins: 12,
      trafficStatus: "Normal",
      feasibility: "Medium",
      notes: "Default logistics fallback due to API limit."
    };
  }
};

export const suggestZonesBasedOnDensity = async (merchants: Merchant[]) => {
  const prompt = `Analyze the geographic spread of these shops in Pakur: ${JSON.stringify(merchants.map(m => ({n: m.name, l: m.address})))}. Suggest the top 3 optimal locations for micro-warehouses (dark stores) to achieve 10-minute delivery coverage across the entire city.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              zoneName: { type: Type.STRING },
              rationale: { type: Type.STRING },
              radiusKm: { type: Type.NUMBER }
            },
            required: ["zoneName", "rationale", "radiusKm"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
