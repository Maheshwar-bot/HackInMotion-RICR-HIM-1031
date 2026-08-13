// Prescription medicine validation service

const rxnormService = require("./rxnorm.service");

// Validate medicines extracted by Gemini OCR
const validatePrescriptionMedicines = async (
  medicines = []
) => {
  if (!Array.isArray(medicines)) {
    throw new Error(
      "Invalid prescription medicine data"
    );
  }

  const validatedMedicines = [];
  const unrecognizedMedicines = [];

  for (const medicine of medicines) {
    const name = medicine?.name?.trim();

    if (!name) {
      continue;
    }

    try {
      // Validate medicine using RxNorm
      const rxnormData =
        await rxnormService.findMedicine(name);

      validatedMedicines.push({
        originalName: name,

        normalizedName:
          rxnormData.inputName,

        rxcui: rxnormData.rxcui,

        strength:
          medicine.strength || "",

        instructions:
          medicine.instructions || "",

        confidence:
          medicine.confidence || "unknown",

        unclear:
          Boolean(medicine.unclear),

        validated: true,
      });
    } catch (error) {
      // Medicine could not be confidently matched
      unrecognizedMedicines.push({
        name,

        strength:
          medicine.strength || "",

        instructions:
          medicine.instructions || "",

        confidence:
          medicine.confidence || "unknown",

        unclear:
          Boolean(medicine.unclear),

        validated: false,
      });
    }
  }

  return {
    validatedMedicines,
    unrecognizedMedicines,
  };
};

module.exports = {
  validatePrescriptionMedicines,
};