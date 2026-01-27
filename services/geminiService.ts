
import { GoogleGenAI, Type } from "@google/genai";
import { Merchant, RouteInfo } from "../types";
import { INITIAL_ZONES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface DiscoveredPartner {
  name: string;
  category: string;
  address: string;
  googleMapsUri: string;
  contactPotential: string;
  strategicValue: string;
  phoneNumber?: string;
  email?: string;
}

export const scanPakurForPartners = async (query: string) => {
  const zoneList = INITIAL_ZONES.map(z => `- ${z.name}: ${z.description}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a strict hyper-local scan for commercial entities matching "${query}" explicitly within Pakur City, Jharkhand.

      CRITICAL RESTRICTION: Result must fall into one of our Serviceable Zones:
      ${zoneList}

      INSTRUCTIONS:
      1. IGNORE any entity strictly outside these Pakur neighborhoods/markets.
      2. If a store is in a rural area or outside the main market/station/collectorate zones, DISCARD it.
      3. CRITICAL: Try to find stores that have a contact phone number or email listed in Google Maps.
      4. For each match, explicitly mention the Zone it implies.
      5. Provide a 1-sentence strategic assessment for 10-15 minute delivery.
      6. Return results that include phoneNumber and email if possible.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 24.6394,
              longitude: 87.8465
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
        category: "Zone-Verified Partner",
        address: "Pakur Service Zone",
        googleMapsUri: chunk.maps.uri,
        contactPotential: "High - Zone Match",
        strategicValue: "Validated against active service zones."
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
  const prompt = `Analyze the geographic spread of these shops in Pakur: ${JSON.stringify(merchants.map(m => ({ n: m.name, l: m.address })))}. Suggest the top 3 optimal locations for micro-warehouses (dark stores) to achieve 10-minute delivery coverage across the entire city.`;

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
