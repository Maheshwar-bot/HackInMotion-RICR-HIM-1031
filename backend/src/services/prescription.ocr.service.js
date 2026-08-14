// Prescription OCR service using Gemini Vision

const { GoogleGenAI } = require("@google/genai");

// Create Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Extract medicine information from prescription image
const extractPrescriptionMedicines = async (
  imageBuffer,
  mimeType
) => {
  // Validate image
  if (!imageBuffer) {
    throw new Error(
      "Prescription image is required"
    );
  }

  if (!mimeType) {
    throw new Error(
      "Prescription image type is required"
    );
  }

  // Convert image buffer to base64
  const base64Image =
    imageBuffer.toString("base64");

  // --------------------------------------------------
  // OCR PROMPT
  // --------------------------------------------------

  const prompt = `
You are MediMitra Prescription OCR.

Your job is ONLY to read the uploaded prescription image
and extract medicine information that is visibly present.

STRICT RULES:

1. Read ONLY what is actually visible in the image.

2. Do NOT invent medicine names.

3. Do NOT guess unclear medicine names.

4. Do NOT diagnose the patient.

5. Do NOT recommend medicines.

6. Do NOT create or modify dosage instructions.

7. Do NOT infer a medicine from the patient's disease.

8. If a medicine name is unclear, mark it as unclear.

9. Extract medicine names exactly as visible whenever possible.

10. Extract strength only when clearly visible.

11. Extract frequency/directions only when clearly visible,
    but do NOT interpret or modify them.

12. The extracted information is OCR output only.
    It must later be validated using RxNorm.

13. If the image is not a prescription or no medicines
    can be identified, return an empty medicines array.

14. Do NOT use outside medical knowledge.

Return ONLY valid JSON matching the requested schema.
`;

  // --------------------------------------------------
  // STRUCTURED RESPONSE SCHEMA
  // --------------------------------------------------

  const responseSchema = {
    type: "object",

    properties: {
      medicines: {
        type: "array",

        items: {
          type: "object",

          properties: {
            name: {
              type: "string",
            },

            strength: {
              type: "string",
            },

            instructions: {
              type: "string",
            },

            confidence: {
              type: "string",
              enum: [
                "high",
                "medium",
                "low",
              ],
            },

            unclear: {
              type: "boolean",
            },
          },

          required: [
            "name",
            "strength",
            "instructions",
            "confidence",
            "unclear",
          ],
        },
      },

      prescriptionDetected: {
        type: "boolean",
      },

      notes: {
        type: "string",
      },
    },

    required: [
      "medicines",
      "prescriptionDetected",
      "notes",
    ],
  };

  try {
    // Send prescription image to Gemini
    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: [
          {
            role: "user",

            parts: [
              {
                text: prompt,
              },

              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],

        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0,
        },
      });

    // Get Gemini response
    const aiText = response.text;

    if (!aiText) {
      throw new Error(
        "Gemini failed to extract prescription information"
      );
    }

    // Parse structured JSON
    let parsedResult;

    try {
      parsedResult = JSON.parse(aiText);
    } catch (error) {
      console.error(
        "PRESCRIPTION OCR JSON PARSE ERROR:"
      );
      console.error(aiText);

      throw new Error(
        "Invalid prescription OCR response"
      );
    }

    // Ensure medicines array exists
    if (!Array.isArray(parsedResult.medicines)) {
      parsedResult.medicines = [];
    }

    return {
      success: true,

      prescriptionDetected:
        Boolean(
          parsedResult.prescriptionDetected
        ),

      medicines:
        parsedResult.medicines,

      notes:
        parsedResult.notes || "",
    };
  } catch (error) {
    console.error(
      "PRESCRIPTION OCR ERROR:"
    );

    console.error(
      "Name:",
      error.name
    );

    console.error(
      "Message:",
      error.message
    );

    if (error.status) {
      console.error(
        "Status:",
        error.status
      );
    }

    throw new Error(
      "Unable to read prescription image"
    );
  }
};

module.exports = {
  extractPrescriptionMedicines,
};