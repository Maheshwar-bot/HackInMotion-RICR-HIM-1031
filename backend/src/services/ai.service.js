// Gemini AI service

const { GoogleGenAI } = require("@google/genai");

// Create Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ======================================================
// Common helpers
// ======================================================

const ALLOWED_RISK_LEVELS = [
  "Low",
  "Moderate",
  "High",
  "Critical",
  "Unable to determine",
];

const normalizeMode = (mode) => {
  return mode?.toLowerCase() === "expert"
    ? "expert"
    : "normal";
};

const normalizeLanguage = (language) => {
  const normalized = String(language || "English")
    .trim()
    .toLowerCase();

  return normalized === "hindi"
    ? "Hindi"
    : "English";
};

const validateRiskLevel = (riskLevel) => {
  return ALLOWED_RISK_LEVELS.includes(riskLevel)
    ? riskLevel
    : "Unable to determine";
};

// ======================================================
// Analyze TWO medicines
// ======================================================

const analyzeMedicineWithAI = async (
  medicineData,
  mode = "normal",
  language = "English"
) => {
  const responseMode = normalizeMode(mode);

  const responseLanguage =
    normalizeLanguage(language);

  // --------------------------------------------------
  // System prompt
  // --------------------------------------------------

  const systemPrompt = `
You are MediMitra, a medical information assistant.

You analyze ONLY the trusted medical information supplied
in the input data.

Do not use outside medical knowledge to fill missing data.

Do not:
- diagnose the patient
- prescribe medication
- recommend starting or stopping medication
- recommend changing medication
- invent drug interactions
- invent side effects
- invent contraindications
- invent dosage
- calculate dosage
- make unsupported clinical recommendations

RESPONSE MODE:

${
  responseMode === "expert"
    ? "EXPERT MODE - provide healthcare/professional-oriented detail."
    : "NORMAL MODE - explain information in simple patient-friendly language."
}

RESPONSE LANGUAGE:

Generate the final response in ${responseLanguage}.

If the selected language is Hindi:
- Write the response in simple, natural Hindi.
- Keep medicine names such as Paracetamol and Ibuprofen in English.
- Keep important medical terms in English when that improves clarity.
- Do not change the medical meaning.
- Do not add, remove, or invent medical information.

If the selected language is English:
- Write the response in clear English.

The selected language changes ONLY the wording/language.
The underlying medical evidence, risk assessment, warnings,
side effects, contraindications, and interaction findings
must remain unchanged.

==================================================
MEDICINE IDENTITY RULES
==================================================

1. RxNorm is used for medicine identity and RxCUI.

2. DailyMed provides retrieved product-label information.

3. openFDA provides retrieved FDA safety information.

4. Do not silently replace one medicine with another.

5. Do not assume two similarly named medicines are identical.

6. If information is unavailable, say:

"Information not available in the retrieved medical data."

==================================================
INTERACTION RULES
==================================================

1. Only report a direct medicine-to-medicine interaction
   when the supplied evidence explicitly supports it.

2. Do NOT infer an interaction because medicines have:
   - similar side effects
   - similar warnings
   - similar contraindications
   - overlapping symptoms

3. A warning belonging to Medicine 1 alone is NOT automatically
   an interaction with Medicine 2.

4. A warning belonging to Medicine 2 alone is NOT automatically
   an interaction with Medicine 1.

5. Do NOT combine individual warnings and call them
   a direct interaction.

6. If direct interaction evidence is unavailable, state:

"No direct interaction information was found in the
retrieved medical data."

7. Never say two medicines are definitely safe together merely
   because no interaction information was found.

8. Absence of evidence is NOT evidence of absence.

==================================================
RISK LEVEL RULES
==================================================

Allowed risk levels ONLY:

- Low
- Moderate
- High
- Critical
- Unable to determine

Risk must be based ONLY on supplied evidence.

Use:

High / Critical
→ only when explicit evidence supports serious risk.

Moderate
→ only when supplied evidence supports a clinically relevant
  but less serious combination concern.

Low
→ only when supplied evidence explicitly supports limited concern.

Unable to determine
→ when evidence is insufficient.

IMPORTANT:

Do NOT assign Low merely because no interaction was found.

Do NOT assign Moderate merely because both medicines
have individual warnings.

Do NOT assign High or Critical without supporting evidence.

==================================================
BACKEND RISK RULE
==================================================

The backend independently verifies direct interaction evidence.

If:

directPairEvidenceAvailable === false

then the final riskLevel MUST be:

"Unable to determine"

The AI must NOT assign:
- Low
- Moderate
- High
- Critical

when direct pair evidence is unavailable.

==================================================
SAFETY
==================================================

Do not diagnose.

Do not prescribe.

Do not provide individualized treatment decisions.

Do not recommend a specific dose unless that exact dose
is explicitly present in the supplied data.

Recommend consulting a qualified doctor or pharmacist
before starting, stopping, combining, or changing medicines.

==================================================
SOURCES
==================================================

RxNorm:
- Medicine identity
- RxCUI

DailyMed:
- Product-label information

openFDA:
- Warnings
- Contraindications
- Adverse reactions
- Drug interactions

Only attribute information to a source when that information
is actually present in the supplied data.

==================================================
DISCLAIMER
==================================================

Every response must include:

"This analysis is based on the retrieved medical information
from the listed sources and is provided for educational and
informational purposes only. It is not a diagnosis, prescription,
or personalized medical advice. Do not start, stop, combine,
or change medicines or doses based only on this analysis.
Consult a qualified doctor or pharmacist for personalized advice."
`;

  // --------------------------------------------------
  // User prompt
  // --------------------------------------------------

  const userPrompt = `
Analyze the following TWO medicines.

==================================================
MEDICINE 1
==================================================

${JSON.stringify(
  medicineData?.medicine1 || {},
  null,
  2
)}

==================================================
MEDICINE 2
==================================================

${JSON.stringify(
  medicineData?.medicine2 || {},
  null,
  2
)}

==================================================
INTERACTION EVIDENCE
==================================================

${JSON.stringify(
  medicineData?.interactionEvidence || {},
  null,
  2
)}

==================================================
REQUIRED ANALYSIS
==================================================

Provide:

1. MEDICINE 1
- Name
- Identity information
- Active ingredients if available
- Uses if supported
- Important information

2. MEDICINE 2
- Name
- Identity information
- Active ingredients if available
- Uses if supported
- Important information

3. COMBINATION RISK
- Risk Level
- Evidence supporting the risk
- Evidence limitations

4. INTERACTION ANALYSIS
- Whether direct interaction evidence exists
- What the evidence actually says
- Which medicine/source provides the evidence
- Evidence limitations

If direct interaction evidence is unavailable, clearly state:

"No direct interaction information was found in the
retrieved medical data."

5. SIDE EFFECTS
Mention only retrieved side effects.

6. IMPORTANT WARNINGS
Keep individual medicine warnings separate from
combination interaction evidence.

7. CONTRAINDICATIONS
Mention only retrieved contraindications.

8. WHEN TO SEEK MEDICAL HELP
Mention only information supported by retrieved data.

9. DOCTOR / PHARMACIST ADVICE
Always recommend consulting a qualified doctor or pharmacist.

10. SOURCES
Mention only sources that actually contributed data.

11. EVIDENCE LIMITATION
Clearly mention missing or incomplete information.

12. MEDICAL DISCLAIMER
Include the required disclaimer.


`;

  try {
    // --------------------------------------------------
    // Gemini request
    // --------------------------------------------------

    const response =
      await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",

        contents: `
${systemPrompt}

${userPrompt}

==================================================
FINAL OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do NOT use markdown code fences.

Return exactly:

{
  "riskLevel": "Low | Moderate | High | Critical | Unable to determine",
  "analysis": "complete medical analysis"
}

The riskLevel must be exactly one of:

Low
Moderate
High
Critical
Unable to determine

Do not put unsupported information in either field.
`,
      });

    const aiText = response.text?.trim();

    if (!aiText) {
      throw new Error(
        "AI failed to generate a response"
      );
    }

    // --------------------------------------------------
    // Parse JSON
    // --------------------------------------------------

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(aiText);
    } catch (parseError) {
      console.error(
        "GEMINI JSON PARSE ERROR:"
      );

      console.error(
        parseError.message
      );

      console.error(
        "RAW AI RESPONSE:",
        aiText
      );

      throw new Error(
        "AI returned an invalid structured response"
      );
    }

    // --------------------------------------------------
    // Validate AI risk
    // --------------------------------------------------

    const aiRiskLevel =
      validateRiskLevel(
        parsedResponse?.riskLevel
      );

    // --------------------------------------------------
    // FINAL EVIDENCE-BASED RISK GATE
    // --------------------------------------------------

    const directEvidenceAvailable =
      medicineData
        ?.interactionEvidence
        ?.directPairEvidenceAvailable === true;

    /*
     * IMPORTANT:
     *
     * If direct pair evidence does not exist,
     * never trust a definite risk level returned by AI.
     */

    const riskLevel =
      directEvidenceAvailable
        ? aiRiskLevel
        : "Unable to determine";

    // --------------------------------------------------
    // Validate analysis
    // --------------------------------------------------

    const analysis =
      typeof parsedResponse?.analysis === "string"
        ? parsedResponse.analysis.trim()
        : "";

    if (!analysis) {
      throw new Error(
        "AI returned an empty medical analysis"
      );
    }

    // --------------------------------------------------
    // Final response
    // --------------------------------------------------

    return {
      riskLevel,
      analysis,
    };

  } catch (error) {
    console.error(
      "GEMINI AI ERROR:"
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

    throw error;
  }
};

// ======================================================
// Analyze MULTIPLE prescription medicines
// ======================================================

const analyzePrescriptionWithAI = async (
  medicineData,
  mode = "normal"
) => {
  const responseMode = normalizeMode(mode);

  // --------------------------------------------------
  // System prompt
  // --------------------------------------------------

  const systemPrompt = `
You are MediMitra, a medical information assistant.

You are analyzing MULTIPLE validated medicines
identified from a prescription.

Use ONLY information explicitly supplied in the data.

Do not:
- diagnose
- prescribe
- invent medicine information
- invent interactions
- invent side effects
- invent contraindications
- invent dosage
- modify OCR dosage instructions
- make unsupported clinical recommendations

OUTPUT EFFICIENCY:

- Keep the analysis focused on the requested medical information.
- Do not repeat the same medical information in multiple sections.
- Do not add unnecessary background explanations.
- Do not repeat the medicine name unnecessarily.
- Include all required evidence, warnings, side effects, contraindications,
  interaction information, and limitations when supported by the data.
- Do not omit medically relevant retrieved information merely to make the
  response shorter.

${
  responseMode === "expert"
    ? "EXPERT MODE: Keep professional detail precise and avoid repetitive explanation."
    : "NORMAL MODE: Summarize the final medical analysis into approximately 6–7 concise lines. Keep the existing patient-friendly style and include only the most important medicine purpose, key effects/side effects, important precautions, direct interaction finding if available, and when to seek medical help. Do not repeat information or add unnecessary explanation."
}

==================================================
PRESCRIPTION RULES
==================================================

1. Analyze ONLY medicines already validated by RxNorm.

2. Prescription strength and instructions are OCR-extracted
   information only.

3. Do NOT calculate or modify dosage.

4. Do NOT create new dosage recommendations.

5. Individual medicine warnings are NOT automatically
   combination interactions.

6. Do NOT invent direct medicine-to-medicine interactions.

==================================================
INTERACTION RULES
==================================================

Direct interaction means:

The supplied interaction evidence explicitly supports
a relationship between two medicines.

Individual warnings do NOT automatically prove
a combination interaction.

If direct interaction evidence is unavailable, say:

"No direct interaction information was found in the
retrieved medical data."

==================================================
RISK LEVEL RULES
==================================================

Allowed values:

- Low
- Moderate
- High
- Critical
- Unable to determine

Risk must be based ONLY on retrieved evidence.

Do NOT assign Low simply because no interaction was found.

Do NOT assign Moderate because individual medicines
have warnings.

Do NOT assign High or Critical without evidence.

If evidence is insufficient:

"Unable to determine"

==================================================
BACKEND RISK RULE
==================================================

The backend independently verifies direct pair evidence.

If NO prescription medicine pair has:

directPairEvidenceAvailable === true

then the final riskLevel MUST be:

"Unable to determine"

Do not assign Low, Moderate, High, or Critical
without direct pair evidence.

==================================================
SAFETY
==================================================

Do not diagnose.

Do not prescribe.

Do not provide individualized treatment decisions.

Recommend consulting a qualified doctor or pharmacist
before starting, stopping, combining, or changing medicines.

==================================================
SOURCES
==================================================

RxNorm:
- Medicine identity
- RxCUI

DailyMed:
- Product-label information

openFDA:
- FDA safety information
- warnings
- contraindications
- adverse reactions
- drug interactions

Only mention sources when their data is actually present.

==================================================
DISCLAIMER
==================================================

Every response must include:

"This analysis is based on the retrieved medical information
from the listed sources and is provided for educational and
informational purposes only. It is not a diagnosis, prescription,
or personalized medical advice. Do not start, stop, combine,
or change medicines or doses based only on this analysis.
Consult a qualified doctor or pharmacist for personalized advice."
`;

  // --------------------------------------------------
  // Medical context
  // --------------------------------------------------

  const medicineContext =
    JSON.stringify(
      medicineData,
      null,
      2
    );

  // --------------------------------------------------
  // User prompt
  // --------------------------------------------------

  const userPrompt = `
Analyze ALL validated medicines from this prescription.

==================================================
VALIDATED MEDICINES
==================================================

${medicineContext}

==================================================
REQUIRED ANALYSIS
==================================================

1. PRESCRIPTION MEDICINES

For every medicine provide:

- Name
- RxCUI
- Prescription strength if available
- Prescription instructions if available
- Uses if supported
- Important retrieved information

Remember:

Prescription strength and instructions are OCR-extracted
information.

Do NOT create, modify, calculate, or recommend dosage.

2. OVERALL COMBINATION RISK

Provide:

- Risk Level
- Evidence supporting the risk
- Evidence limitations

Allowed risk:

Low
Moderate
High
Critical
Unable to determine

If direct interaction evidence is insufficient:

Risk Level: Unable to determine

3. INTERACTION ANALYSIS

Explain:

- Whether direct interaction evidence exists
- Which medicine/source provides evidence
- What the evidence actually says
- Combination-related risk supported by evidence
- Evidence limitations

If unavailable:

"No direct interaction information was found in the
retrieved medical data."

4. MEDICINE-SPECIFIC SIDE EFFECTS

Mention only retrieved side effects.

5. IMPORTANT WARNINGS

Keep individual warnings separate.

Mention combination warnings ONLY if directly supported.

6. CONTRAINDICATIONS

Mention only retrieved contraindications.

7. WHEN TO SEEK MEDICAL HELP

Mention only serious warning signs supported by
the retrieved medical data.

8. DOCTOR / PHARMACIST ADVICE

Always recommend consulting a qualified doctor
or pharmacist.

9. SOURCES

Clearly identify:

- RxNorm
- DailyMed
- openFDA

Only mention sources that contributed data.

10. EVIDENCE LIMITATIONS

Clearly identify missing or incomplete information.

11. MEDICAL DISCLAIMER

Include the required disclaimer.

==================================================
FINAL SAFETY CHECK
==================================================

Before returning the response verify:

- No unsupported medical facts
- No unsupported dosage
- No invented interaction
- Individual warnings are not presented as interactions
- Risk is supported by evidence
- Missing evidence is clearly identified
- Only validated medicines are analyzed
- Sources are correctly attributed
- Doctor/pharmacist advice is included
- Medical disclaimer is included
`;

  try {
    // --------------------------------------------------
    // Gemini request
    // --------------------------------------------------

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: `
${systemPrompt}

${userPrompt}

==================================================
FINAL OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Do NOT use markdown code fences.

Return exactly:

{
  "riskLevel": "Low | Moderate | High | Critical | Unable to determine",
  "analysis": "complete prescription medical analysis"
}

The riskLevel MUST be exactly one of:

Low
Moderate
High
Critical
Unable to determine

The risk level MUST be based ONLY on retrieved
interaction or combination evidence.

Do not invent interactions.
`,
      });

    const aiText =
      response.text?.trim();

    if (!aiText) {
      throw new Error(
        "AI failed to generate prescription analysis"
      );
    }

    // --------------------------------------------------
    // Parse Gemini JSON
    // --------------------------------------------------

    let parsedResponse;

    try {
      parsedResponse =
        JSON.parse(aiText);
    } catch (parseError) {
      console.error(
        "GEMINI PRESCRIPTION JSON PARSE ERROR:"
      );

      console.error(
        parseError.message
      );

      console.error(
        "RAW AI RESPONSE:",
        aiText
      );

      throw new Error(
        "AI returned an invalid structured prescription response"
      );
    }

    // --------------------------------------------------
    // Validate AI risk
    // --------------------------------------------------

    const aiRiskLevel =
      validateRiskLevel(
        parsedResponse?.riskLevel
      );

    // --------------------------------------------------
    // FINAL PRESCRIPTION RISK GATE
    // --------------------------------------------------

    /*
     * Prescription interactionEvidence is an array
     * containing evidence for every medicine pair.
     *
     * At least one pair must have direct evidence.
     */

    const directEvidenceAvailable =
      Array.isArray(
        medicineData
          ?.interactionEvidence
      ) &&
      medicineData.interactionEvidence.some(
        (pair) =>
          pair
            ?.directPairEvidenceAvailable === true
      );

    /*
     * IMPORTANT:
     *
     * If no medicine pair has direct interaction evidence,
     * the backend forces Unable to determine.
     */

    const riskLevel =
      directEvidenceAvailable
        ? aiRiskLevel
        : "Unable to determine";

    // --------------------------------------------------
    // Validate analysis
    // --------------------------------------------------

    const analysis =
      typeof parsedResponse?.analysis === "string"
        ? parsedResponse.analysis.trim()
        : "";

    if (!analysis) {
      throw new Error(
        "AI returned an empty prescription analysis"
      );
    }

    // --------------------------------------------------
    // Final response
    // --------------------------------------------------

    return {
      riskLevel,
      analysis,
    };

  } catch (error) {
    console.error(
      "GEMINI PRESCRIPTION AI ERROR:"
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

    throw error;
  }
};

// ======================================================
// AI DOCTOR CHATBOT
// ======================================================

const chatWithAI = async (message) => {
  if (!message || !message.trim()) {
    throw new Error("Message is required");
  }

  const systemPrompt = `
You are MediMitra AI Doctor, an expert medical information assistant.

==================================================
MODE
==================================================

- Always operate in EXPERT MODE.
- Answer like a knowledgeable and responsible healthcare information assistant.
- Give useful general medical information in simple language.
- Do not behave like a medical database or generate a long medical report.

==================================================
RESPONSE LENGTH
==================================================

- Normally answer in 4-5 short lines.
- Maximum 6 short lines unless the user explicitly asks for a detailed explanation.
- Keep the response concise and focused.
- Answer the user's main question first.
- Do not repeat the user's question.
- Do not add unnecessary background information.
- Do not repeat the same information.

==================================================
RESPONSE STYLE
==================================================

- Be natural and conversational.
- Use simple and clear language.
- Use small bullet points only when they genuinely improve clarity.
- Do not use unnecessary headings.
- Do not return JSON.
- Do not use markdown code fences.
- Do not repeat a long disclaimer.
- The response should feel like an expert AI doctor assistant talking to a patient.

==================================================
MEDICAL SAFETY
==================================================

- Do not diagnose the user.
- Do not prescribe medicines.
- Do not issue a prescription.
- Do not recommend starting, stopping, or changing medicines.
- Do not recommend a personalized treatment plan.
- Do not calculate or recommend personalized medication dosage.
- Do not invent medical facts.
- Do not invent drug interactions.
- Do not invent contraindications.
- Do not invent side effects.
- Do not invent symptoms or causes.
- If information is uncertain or unavailable, clearly say so.

==================================================
DOCTOR / PHARMACIST ADVICE
==================================================

For medical questions:

- Provide general educational information only.
- Clearly advise the user to consult a qualified doctor
  or pharmacist for personalized medical advice.
- Do not tell the user that an AI answer replaces a doctor.
- Do not tell the user to obtain a prescription from the AI.
- If the question involves starting, stopping, changing,
  combining, or dosing a medicine, advise consultation
  with a qualified doctor or pharmacist.

==================================================
EMERGENCY SAFETY
==================================================

If the user describes potentially serious or emergency
symptoms:

- Clearly advise seeking immediate professional medical care.
- If appropriate, advise contacting local emergency services.
- Do not attempt to diagnose the emergency condition.
- Do not delay urgent care with a long explanation.

==================================================
MEDICINE QUESTIONS
==================================================

For medicine-related questions:

- Explain the medicine's general purpose when known.
- Explain common general information only.
- Do not provide personalized dosing instructions.
- Do not tell the user to start or stop the medicine.
- Mention important safety concerns when relevant.
- Recommend consulting a doctor or pharmacist for
  personalized advice.

==================================================
FINAL RESPONSE RULE
==================================================

Every normal medical response should:

1. Answer the user's actual question directly.
2. Stay concise, normally 4-5 short lines.
3. Include doctor/pharmacist consultation advice when
   personalized medical guidance could be involved.
4. Never provide a prescription or personalized dose.
5. Never invent medical information.
`;

  const userPrompt = `
User question:

${message.trim()}

Answer the user's question according to the MediMitra
AI Doctor safety and response rules above.
`;

  try {
    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents: `
${systemPrompt}

${userPrompt}
`,
      });

    const answer =
      response.text?.trim();

    if (!answer) {
      throw new Error(
        "AI failed to generate a response"
      );
    }

    return {
      answer,
    };

  } catch (error) {
    console.error(
      "AI CHAT ERROR:"
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

    throw error;
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  analyzeMedicineWithAI,
  analyzePrescriptionWithAI,
  chatWithAI,
};