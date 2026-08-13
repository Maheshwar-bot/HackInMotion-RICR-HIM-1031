// Gemini AI service

const { GoogleGenAI } = require("@google/genai");

// Create Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Generate medicine interaction analysis using Gemini
const analyzeMedicineWithAI = async (medicineData) => {
  const systemPrompt = `
You are MediMitra, a medical information assistant.

Your job is to analyze trusted medicine information and explain it
clearly and safely to the user.

IMPORTANT SAFETY RULES:

- Use ONLY the medical information provided in the input data.
- Do NOT invent medical facts.
- Do NOT diagnose the patient.
- Do NOT prescribe medication.
- Do NOT recommend changing, stopping, or starting medication.
- Do NOT create a dosage that is not present in the provided data.
- Explain complex medical terms in simple language.
- Clearly distinguish between known information and unavailable information.
- If interaction information is not available in the provided data,
  explicitly say that interaction information is unavailable.
- Do not assume that two medicines interact simply because they have
  similar side effects.
- Do not claim that two medicines are safe together unless the
  provided data supports that conclusion.
- Encourage the user to consult a doctor or pharmacist for
  personalized medical advice.

Your analysis must be based on the provided medicine data.
`;

  // Convert medicine data into readable JSON
  const medicineContext = JSON.stringify(
    medicineData,
    null,
    2
  );

  const userPrompt = `
Analyze the following TWO medicines together.

MEDICINE 1:
${JSON.stringify(
  medicineData.medicine1,
  null,
  2
)}

MEDICINE 2:
${JSON.stringify(
  medicineData.medicine2,
  null,
  2
)}

Provide the response in the following structure:

1. Medicine 1
   - Name
   - General uses
   - Important information available

2. Medicine 2
   - Name
   - General uses
   - Important information available

3. Interaction between the two medicines
   - Whether interaction information is available
   - What the provided data says about the interaction
   - Possible problems or risks mentioned in the provided data
   - Severity/importance only if supported by the provided data

4. Side effects
   - Relevant side effects of Medicine 1
   - Relevant side effects of Medicine 2

5. Important warnings
   - Warnings for Medicine 1
   - Warnings for Medicine 2
   - Any combination-related warning supported by the data

6. Contraindications
   - Relevant contraindications from the provided data

7. When to seek professional medical help
   - Mention important warning signs only when supported by
     the provided medical information.

8. Safety summary
   - Give a short, simple summary for the patient.
   - Do not prescribe or change medication.

If information for any section is missing, clearly write:
"Information not available in the provided medical data."

Keep the language simple and patient-friendly.

MEDICAL DATA:
${medicineContext}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `${systemPrompt}\n\n${userPrompt}`,
    });

    const aiText = response.text;

    if (!aiText) {
      throw new Error(
        "AI failed to generate a response"
      );
    }

    return aiText;
  } catch (error) {
    console.error("GEMINI AI ERROR:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    if (error.status) {
      console.error("Status:", error.status);
    }

    throw error;
  }
};

module.exports = {
  analyzeMedicineWithAI,
};