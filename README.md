# PakurFast Q-Commerce Logistics Command

**PakurFast** is an advanced Q-Commerce logistics planning and partner intelligence dashboard designed specifically for the city of **Pakur, Jharkhand**. 

This application serves as a central "Command Center" for hyper-local delivery operations, leveraging **Google AI (Gemini 2.5/3.0)** to provide real-time strategic intelligence on merchant partnerships, zone planning, and delivery feasibility.

---

## 🚀 Key Features

### 1. 🌍 AI-Powered City Scanning
- **Real-Time Partner Discovery**: Leverages Gemini 2.5 Flash to perform deep scans of Pakur's commercial nodes (Harindanga, Railway Colony, Main Market) to identify potential partners (pharmacies, kirana stores, bakeries).
- **Grounding with Google Maps**: Uses Google Maps grounding to ensure all suggested partners are real, verifiable physical entities with accurate geolocations.

### 2. 🧠 Intelligent Zone Planning
- **Algorithm**: `suggestZonesBasedOnDensity`
- **Function**: Analyzes the geospatial density of existing merchant partners.
- **Output**: Recommends optimal 10-minute delivery zones and micro-warehouse locations to maximize coverage efficiency.

### 3. 🚚 Route Logistics Engine
- **Algorithm**: `getRouteLogistics`
- **Function**: Calculates the feasibility of 15-minute delivery from a specific merchant node.
- **Metrics Calculated**:
    - **Estimated Distance (km)**: Point-to-point calculation to nearest residential density.
    - **Time Estimation (mins)**: AI-adjusted travel time accounting for local Pakur traffic patterns (e.g., Railway Crossing delays).
    - **Feasibility Score**: High/Medium/Low rating based on distance-to-time ratio.

### 4. 📊 Tactical Dashboard
- **Interactive Map**: Visualizes service zones (polygons) and merchant nodes (pins) on a Leaflet map.
- **Responsive Design**: Fully adaptive layout that works seamlessly on desktop control rooms and field agents' mobile devices.
- **Data Export**: One-click JSON export of partner logistics data for offline route planning.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Utility-first, responsive design)
- **Maps**: Leaflet (OpenStreetMap visualization)
- **Intelligence**: Google GenAI SDK (`@google/genai`)
    - **Models Used**: 
        - `gemini-2.5-flash` (High-speed discovery)
        - `gemini-3-flash-preview` (Logistics calculation)
        - `gemini-3-pro-preview` (Complex spatial analysis)
- **Icons**: Lucide React

---

## ⚙️ How It Works

### The Intelligence Pipeline

1.  **Input**: Operational Manager searches for a category (e.g., "Wholesale Grocery") or selects an existing partner.
2.  **Processing**:
    - **Discovery**: The app sends a prompt to Gemini 2.5 Flash with Google Maps grounding to find real-world entities matching the query in Pakur.
    - **Grounding**: The AI verifies the existence of the store and retrieves its `googleMapsUri` and address.
3.  **Analysis**:
    - **Logistics**: When a partner is selected, Gemini 3 Flash calculates the `distanceKm` and `estimatedTimeMins` to the nearest demand cluster.
    - **Feasibility Logic**:
        - *If Time < 10 mins*: **High Feasibility** (Prime for Q-Commerce)
        - *If Time 10-20 mins*: **Medium Feasibility** (Standard Delivery)
        - *If Time > 20 mins*: **Low Feasibility** (Requires micro-hub)
4.  **Action**:
    - The user can "Export Partner Data" to generate a JSON file containing the verified address, coordinates, and logistics profile for onboarding.

---

## 📐 Calculation & Logic Details

The system avoids generic "crow-fly" distances by using AI to simulate local constraints.

### Route Feasibility (`getRouteLogistics`)

We prompt the model to act as a local logistics expert:

```typescript
// services/geminiService.ts

const prompt = `Calculate delivery feasibility for a quick commerce hub at ${merchantName}, ${address}, Pakur. 
Estimate distance to the nearest residential hub, travel time in local Pakur traffic...
Return JSON only.`;
```

**Output Schema:**
```json
{
  "distanceKm": 1.2,
  "estimatedTimeMins": 8,
  "trafficStatus": "Congested at Station Road",
  "feasibility": "High",
  "notes": "Direct access via Harindanga mainline avoids crossing."
}
```

### Zone Optimization (`suggestZonesBasedOnDensity`)

We feed the `(User, Location)` vector of all known merchants to the AI. The AI clusters these points and identifies "gaps" or "centroids" that would serve as the best locations for new Dark Stores.

---

## 💻 Setup & Installation

### Prerequisites
- Node.js (v18+)
- Gemini API Key (with Grounding search enabled)
- Vercel CLI (for deployment)

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/pakurfast-command.git
cd pakurfast-command
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Run Locally
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000`.

### 4. Deploy to Vercel
```bash
# Link project
npx vercel link

# Add Env Variable (Production, Preview, Dev)
echo "your_api_key" | npx vercel env add GEMINI_API_KEY production
echo "your_api_key" | npx vercel env add GEMINI_API_KEY preview
echo "your_api_key" | npx vercel env add GEMINI_API_KEY development

# Deploy
npx vercel --prod
```

---

## 📱 Mobile Responsiveness

The application features a "Command Mode" on Desktop and "Field Mode" on Mobile.
- **Desktop**: 3-Pane View (List | Map | Details)
- **Mobile**: Tab-based Navigation (Partners <-> Map <-> Intel)

---

## 📄 License

Internal Tool for PakurFast Logistics Operations.
Proprietary & Confidential.
