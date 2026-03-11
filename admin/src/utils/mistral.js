export const extractVehicleData = async (rawText, imageBase64 = null) => {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    const endpoint = "https://api.mistral.ai/v1/chat/completions";

    const prompt = `
    Analyze the following vehicle description AND/OR image and extract the data in a strict JSON format.
    If a field is not found, leave it as an empty string or null.
    
    Fields to extract:
    - brand (e.g. BMW)
    - model (e.g. M5)
    - version (e.g. S-Line, Pack M)
    - year (number)
    - price (number)
    - mileage (number)
    - fuel (One of: Essence, Diesel, Hybride, Hybride Rechargeable, Électrique, GPL, Bioéthanol)
    - transmission (One of: Manuelle, Automatique, Semi-automatique)
    - type (One of: Berline, SUV, Break, Coupé, Cabriolet, Compacte, Citadine, Van / Monospace, Pick-up, Utilitaire)
    - power (number)
    - color (One of: Noir, Blanc, Gris, Argent, Bleu, Rouge, Jaune, Vert, Marron, Beige, Orange, Violet, Autre)
    - features (Array of strings from: Bluetooth, Ordinateur de bord, Lecteur CD, Vitres électriques, Rétroviseur extérieur électrique, Réglage électrique des sièges, Kit mains libres, Affichage tête haute, Isofix, Volant multifonction, GPS, Capteur de pluie, Toit ouvrant, Direction assistée, Sièges chauffants, Trappe à skis, Chauffage auxiliaire, Système Stop & Start, Fermeture centralisée, Caméra de recul, Régulateur de vitesse, Aide au stationnement, Jantes alliage, Phares LED, Traction intégrale (AWD/4WD))
    - description (A short professional summary in FRENCH based on the text or what you see on the image)

    Text description (if any): "${rawText || 'No text provided, analyze image only'}"
    
    Return ONLY JSON. All text values MUST be in French.
  `;

    const messages = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt }
            ]
        }
    ];

    if (imageBase64) {
        messages[0].content.push({
            type: "image_url",
            image_url: `data:image/jpeg;base64,${imageBase64}`
        });
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "pixtral-12b-latest",
                messages,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || response.statusText);
        }

        const result = await response.json();
        const content = result.choices[0].message.content;
        return JSON.parse(content);
    } catch (error) {
        console.error("Mistral Extraction Error:", error);
        throw error;
    }
};
