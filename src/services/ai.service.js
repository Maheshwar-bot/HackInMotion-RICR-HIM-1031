// Gemini AI service

const { GoogleGenAI } = require("@google/genai");

// Create Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Generate medicine interaction analysis using Gemini
const analyzeMedicineWithAI = async (
  medicineData,
  mode = "normal"
) => {
  // Normalize response mode
  const responseMode =
    mode?.toLowerCase() === "expert"
      ? "expert"
      : "normal";

  // --------------------------------------------------
  // SYSTEM INSTRUCTIONS
  // --------------------------------------------------

  const systemPrompt = `
You are MediMitra, a medical information assistant.

You analyze ONLY the trusted medical information supplied
in the input data and explain it safely.

RESPONSE MODE:
${
  responseMode === "expert"
    ? "EXPERT MODE - provide healthcare/professional-oriented detail."
    : "NORMAL MODE - explain information in simple patient-friendly language."
}

==================================================
STRICT EVIDENCE RULES
==================================================

1. Use ONLY information explicitly present in the supplied data.

2. Do NOT use general medical knowledge from your own training
   to fill missing information.

3. Do NOT invent medical facts, interactions, warnings,
   contraindications, side effects, dosages, mechanisms,
   or clinical recommendations.

4. Do NOT diagnose the patient.

5. Do NOT prescribe medication.

6. Do NOT recommend starting, stopping, combining, or changing
   medication.

7. Do NOT calculate, infer, convert, or substitute medication doses.

8. If dosage information is not explicitly present in the supplied
   data, say:

   "Information not available in the retrieved medical data."

9. Do not turn general medical knowledge into a claim simply
   because it is commonly known.

==================================================
MEDICINE IDENTITY RULES
==================================================

10. RxNorm information is primarily used for medicine identity
    and RxCUI identification.

11. DailyMed information represents retrieved product-label data.

12. openFDA information represents retrieved FDA label
    safety data.

13. If a retrieved product contains multiple active ingredients,
    explicitly identify the additional active ingredients.

14. Never silently treat a combination product as a
    single-ingredient medicine.

15. If the retrieved product does not clearly match the requested
    medicine, clearly state the limitation.

16. Do not assume that a retrieved product is an exact match
    simply because the medicine name is similar.

17. Never silently replace the requested medicine with another
    ingredient or product.

==================================================
INTERACTION RULES
==================================================

18. Only report a direct medicine-to-medicine interaction when
    the supplied evidence explicitly supports it.

19. Do NOT infer an interaction because two medicines have:
    - similar side effects
    - similar warnings
    - similar contraindications
    - overlapping symptoms

20. A warning belonging to Medicine 1 alone is NOT automatically
    an interaction with Medicine 2.

21. A warning belonging to Medicine 2 alone is NOT automatically
    an interaction with Medicine 1.

22. Do NOT combine separate warnings and present them as proof
    of a direct interaction.

23. If direct interaction evidence is unavailable, say:

    "No direct interaction information was found in the
    retrieved medical data."

24. Never say that two medicines are definitely safe together
    merely because interaction information was not found.

25. Absence of evidence is NOT evidence of absence.

==================================================
INTERACTION EVIDENCE PRIORITY
==================================================

When evaluating a combination:

1. Give highest importance to explicit drug-interaction evidence.

2. Then consider explicit combination-related warnings.

3. Individual medicine warnings may be mentioned separately,
   but they must NOT be presented as direct interactions unless
   the supplied data explicitly establishes that relationship.

4. If only individual warnings are available and no direct
   interaction evidence exists, clearly state the limitation.

==================================================
RISK LEVEL RULES
==================================================

Allowed risk levels are ONLY:

- Low
- Moderate
- High
- Critical
- Unable to determine

Risk level MUST be based ONLY on supplied evidence.

If explicit interaction evidence supports serious risk:
→ High or Critical may be appropriate.

If evidence supports a clinically relevant but less serious
combination concern:
→ Moderate may be appropriate.

If supplied evidence explicitly supports limited concern:
→ Low may be appropriate.

If evidence is insufficient:
→ Unable to determine.

IMPORTANT:

- Do NOT assign Low merely because no interaction was found.
- Do NOT assign Moderate merely because both medicines have
  individual warnings.
- Do NOT assign High or Critical without supporting evidence.
- Do NOT upgrade or downgrade risk without evidence.
- Always explain why the selected risk level was assigned.

==================================================
SOURCE ATTRIBUTION
==================================================

Clearly distinguish source roles.

RxNorm:
- Medicine identity
- RxCUI

DailyMed:
- Retrieved product-label information
- Product-specific label information when available

openFDA:
- FDA label safety information
- warnings
- adverse reactions
- contraindications
- drug interactions

Do NOT claim that a source provided information unless that
information is actually present in the supplied data.

If a source has no relevant retrieved information, do not imply
that the source supports a medical claim.

==================================================
MISSING INFORMATION
==================================================

When information is unavailable, write:

"Information not available in the retrieved medical data."

Do NOT guess or fill missing information using outside knowledge.

==================================================
MEDICAL SAFETY
==================================================

Do NOT diagnose.

Do NOT prescribe.

Do NOT provide individualized treatment decisions.

Do NOT recommend a specific dose unless that exact dose is
explicitly present in the supplied data.

Recommend consulting a qualified doctor or pharmacist before
starting, stopping, combining, or changing medicines.

If the retrieved evidence contains serious warning signs,
explain when professional or urgent medical attention may
be appropriate.

Do NOT invent emergency symptoms.

==================================================
RESPONSE MODES
==================================================

NORMAL MODE:

- Use simple language.
- Explain difficult medical terms.
- Keep the answer understandable for a general user.
- Focus on what the user needs to know.
- Avoid unnecessary technical terminology.

EXPERT MODE:

- Provide more detailed professional-oriented information.
- Medical terminology may be used when supported by the data.
- Clearly identify evidence and limitations.
- Explain interaction evidence in greater technical detail.
- Do not provide unsupported clinical recommendations.

Both modes MUST use exactly the same evidence and safety rules.

==================================================
DOCTOR / PHARMACIST ADVICE
==================================================

Every response must recommend consulting a qualified doctor
or pharmacist before starting, stopping, combining, or changing
medicines.

For Moderate, High, Critical, or Unable to determine risk,
make the recommendation especially clear.

==================================================
MEDICAL DISCLAIMER
==================================================

Every response MUST include a medical disclaimer.

The disclaimer must communicate that the analysis:

- is based on retrieved medical information
- is for educational/informational purposes
- is not a diagnosis
- is not a prescription
- is not personalized medical advice
- should not be used alone to start, stop, combine, or change
  medicines or doses
- requires consultation with a qualified doctor or pharmacist
  for personalized advice
`;
  
  // --------------------------------------------------
  // MEDICAL DATA
  // --------------------------------------------------

  const medicineContext = JSON.stringify(
    medicineData,
    null,
    2
  );

  // --------------------------------------------------
  // USER PROMPT
  // --------------------------------------------------

  const userPrompt = `
Analyze the following TWO medicines together.

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
REQUIRED RESPONSE
==================================================

Return the analysis using the following structure.

1. MEDICINE 1

- Name
- Medicine identity information
- Active ingredients ONLY if explicitly available
- General uses ONLY if supported by the provided data
- Important information available

IMPORTANT:
If the retrieved product contains multiple active ingredients,
explicitly mention them.

Do not silently represent a combination product as a
single-ingredient medicine.

2. MEDICINE 2

- Name
- Medicine identity information
- Active ingredients ONLY if explicitly available
- General uses ONLY if supported by the provided data
- Important information available

3. COMBINATION RISK

- Risk Level:
  Choose ONLY one:

  Low
  Moderate
  High
  Critical
  Unable to determine

- Evidence supporting the selected risk level
- Evidence limitations

IMPORTANT:

If direct interaction evidence is insufficient, the risk MUST
be "Unable to determine".

Do NOT assign Low Risk simply because no interaction information
was found.

Do NOT assign Moderate, High, or Critical merely because the
individual medicines have warnings.

4. INTERACTION ANALYSIS

Explain:

- Whether direct interaction evidence is available
- What the retrieved evidence actually says
- Which medicine or source provides the evidence
- Any direct combination-related risk supported by the evidence
- Evidence limitations

IMPORTANT:

Do NOT convert individual medicine warnings into a
medicine-to-medicine interaction.

If direct interaction evidence is unavailable, write:

"No direct interaction information was found in the
retrieved medical data."

5. SIDE EFFECTS

Medicine 1:
- Relevant side effects supported by the data

Medicine 2:
- Relevant side effects supported by the data

Do not add side effects from outside knowledge.

6. IMPORTANT WARNINGS

Medicine 1:
- Relevant warnings supported by the data

Medicine 2:
- Relevant warnings supported by the data

Combination:
- Combination-related warning ONLY if directly supported
  by the retrieved evidence

Individual warnings must remain clearly separated from
combination-related evidence.

7. CONTRAINDICATIONS

Mention relevant contraindications from the retrieved data.

Do not invent contraindications.

8. WHEN TO SEEK MEDICAL HELP

Mention serious warning signs ONLY when supported by
the provided medical data.

Explain when the user should contact a doctor/pharmacist.

If the retrieved evidence supports urgent medical attention,
clearly mention it.

Do NOT invent emergency symptoms.

9. DOCTOR / PHARMACIST ADVICE

Always include a clear recommendation to consult a qualified
doctor or pharmacist before starting, stopping, combining,
or changing medicines.

For Moderate, High, Critical, or Unable to determine risk,
make this recommendation especially clear.

10. SOURCES

Clearly identify the contribution of each retrieved source.

Use this format where applicable:

- RxNorm — medicine identity / RxCUI
- DailyMed — retrieved product-label information
- openFDA — retrieved FDA safety-label information

IMPORTANT:

Only list a source as supporting information when relevant
data from that source is actually present.

Do not claim that DailyMed provided information if the
retrieved DailyMed data did not contain relevant information.

11. EVIDENCE LIMITATION

Clearly state important limitations when:

- direct interaction information is unavailable
- product-specific information is unavailable
- medicine identity/product matching is uncertain
- safety information is incomplete

Use:

"Information not available in the retrieved medical data."

when appropriate.

12. MEDICAL DISCLAIMER

Always include this disclaimer:

"This analysis is based on the retrieved medical information
from the listed sources and is provided for educational and
informational purposes only. It is not a diagnosis, prescription,
or personalized medical advice. Do not start, stop, combine,
or change medicines or doses based only on this analysis.
Consult a qualified doctor or pharmacist for personalized advice."

==================================================
FINAL SAFETY CHECK
==================================================

Before generating the final answer, verify:

- No unsupported medical facts were added.
- No unsupported dosage was added.
- No direct interaction was invented.
- Individual warnings were not presented as interactions.
- Risk level is supported by evidence.
- Missing evidence is clearly identified.
- Combination products are explicitly identified.
- Sources are accurately attributed.
- Doctor/pharmacist advice is included.
- Disclaimer is included.

==================================================
FULL MEDICAL DATA
==================================================

${medicineContext}
`;

  // --------------------------------------------------
  // GENERATE RESPONSE
  // --------------------------------------------------

  try {
    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents:
          `${systemPrompt}\n\n${userPrompt}`,
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
      console.error(
        "Status:",
        error.status
      );
    }

    throw error;
  }
};

module.exports = {
  analyzeMedicineWithAI,
};