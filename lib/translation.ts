import { generateText } from "ai"
import { openproviders } from "@/lib/openproviders"

// Medical terms that should be preserved in English with Vietnamese translation
const MEDICAL_TERMS_PATTERN = /\b(antibiotic|antibiotics|medication|medicine|drug|drugs|prescription|dose|dosage|symptom|symptoms|diagnosis|treatment|therapy|surgery|hospital|doctor|physician|nurse|patient|disease|illness|infection|virus|bacteria|cancer|diabetes|hypertension|blood pressure|heart rate|temperature|fever|pain|headache|migraine|asthma|pneumonia|bronchitis|flu|covid|coronavirus|vaccine|vaccination|immune|immunity|allergy|allergic|chronic|acute|syndrome|disorder|condition|medical|clinical|pharmaceutical|pharmacology|pathology|radiology|cardiology|neurology|oncology|pediatric|geriatric|anesthesia|surgery|surgical|operation|procedure|biopsy|scan|x-ray|mri|ct scan|ultrasound|ecg|ekg|blood test|urine test|cholesterol|glucose|insulin|hormone|vitamin|mineral|supplement|tablet|capsule|injection|intravenous|oral|topical|inhaler|nebulizer|stethoscope|thermometer|syringe|bandage|wound|cut|bruise|fracture|sprain|strain|burn|rash|swelling|inflammation|bleeding|nausea|vomiting|diarrhea|constipation|fatigue|dizziness|shortness of breath|chest pain|abdominal pain|back pain|joint pain|muscle pain|side effects|adverse reaction|contraindication|indication|prognosis|recovery|rehabilitation|physical therapy|occupational therapy|mental health|depression|anxiety|stress|insomnia|sleep disorder|eating disorder|substance abuse|addiction|withdrawal|detox|overdose|emergency|urgent care|icu|intensive care|ambulance|paramedic|first aid|cpr|aed|defibrillator)\b/gi

// Translation utility using Gemma3:4b for fast translation
export async function translateToEnglish(text: string): Promise<string> {
  try {
    // Check if text is already in English (basic check)
    if (isLikelyEnglish(text)) {
      return text
    }

    const model = openproviders("gemma3:4b" as string)
    
    const result = await generateText({
      model,
      prompt: `Translate the following text to English. If it's already in English, return it unchanged. Only return the translation without any explanation:

${text}`,
      maxTokens: 1000,
    })

    return result.text.trim()
  } catch (error) {
    console.warn("Translation failed, using original text:", error)
    // Return original text if translation fails
    return text
  }
}

// Translation utility to translate English responses to Vietnamese
export async function translateToVietnamese(text: string): Promise<string> {
  try {
    console.log("translateToVietnamese called with text length:", text.length)
    console.log("Text preview:", text.substring(0, 100))
    
    const model = openproviders("gemma3:4b" as string)
    
    // Extract medical terms to preserve them
    const medicalTerms = new Map<string, string>()
    let processedText = text
    
    // Find all medical terms and replace with placeholders
    const matches = text.match(MEDICAL_TERMS_PATTERN) || []
    matches.forEach((term, index) => {
      const placeholder = `__MEDICAL_TERM_${index}__`
      medicalTerms.set(placeholder, term)
      processedText = processedText.replace(new RegExp(`\\b${term}\\b`, 'gi'), placeholder)
    })
    
    console.log("Calling generateText with model...")
    const result = await generateText({
      model,
      prompt: `Translate the following English text to Vietnamese. Keep any placeholder text (like __MEDICAL_TERM_X__) unchanged. Provide natural, fluent Vietnamese translation:

${processedText}`,
      maxTokens: 2000,
    })

    console.log("generateText completed, result length:", result.text.length)
    let translatedText = result.text.trim()
    
    // Replace placeholders with medical terms in format: Vietnamese (English)
    medicalTerms.forEach((englishTerm, placeholder) => {
      // Try to translate the medical term to Vietnamese, but keep the English in parentheses
      translatedText = translatedText.replace(
        new RegExp(placeholder, 'g'),
        `${getVietnameseMedicalTerm(englishTerm)} (${englishTerm})`
      )
    })

    console.log("Final translated text length:", translatedText.length)
    return translatedText
  } catch (error) {
    console.warn("Vietnamese translation failed, using original text:", error)
    return text
  }
}

// Helper function to get Vietnamese translation for common medical terms
function getVietnameseMedicalTerm(englishTerm: string): string {
  const medicalTranslations: Record<string, string> = {
    'antibiotic': 'thuốc kháng sinh',
    'antibiotics': 'thuốc kháng sinh',
    'medication': 'thuốc',
    'medicine': 'thuốc',
    'drug': 'thuốc',
    'drugs': 'thuốc',
    'prescription': 'đơn thuốc',
    'dose': 'liều',
    'dosage': 'liều lượng',
    'symptom': 'triệu chứng',
    'symptoms': 'triệu chứng',
    'diagnosis': 'chẩn đoán',
    'treatment': 'điều trị',
    'therapy': 'liệu pháp',
    'surgery': 'phẫu thuật',
    'hospital': 'bệnh viện',
    'doctor': 'bác sĩ',
    'physician': 'bác sĩ',
    'nurse': 'y tá',
    'patient': 'bệnh nhân',
    'disease': 'bệnh',
    'illness': 'bệnh tật',
    'infection': 'nhiễm trùng',
    'virus': 'vi-rút',
    'bacteria': 'vi khuẩn',
    'cancer': 'ung thư',
    'diabetes': 'tiểu đường',
    'hypertension': 'tăng huyết áp',
    'blood pressure': 'huyết áp',
    'heart rate': 'nhịp tim',
    'temperature': 'nhiệt độ',
    'fever': 'sốt',
    'pain': 'đau',
    'headache': 'đau đầu',
    'migraine': 'đau nửa đầu',
    'asthma': 'hen suyễn',
    'pneumonia': 'viêm phổi',
    'bronchitis': 'viêm phế quản',
    'flu': 'cúm',
    'covid': 'COVID',
    'coronavirus': 'vi-rút corona',
    'vaccine': 'vắc-xin',
    'vaccination': 'tiêm chủng',
    'immune': 'miễn dịch',
    'immunity': 'miễn dịch',
    'allergy': 'dị ứng',
    'allergic': 'dị ứng',
    'chronic': 'mãn tính',
    'acute': 'cấp tính',
    'syndrome': 'hội chứng',
    'disorder': 'rối loạn',
    'condition': 'tình trạng',
    'medical': 'y tế',
    'clinical': 'lâm sàng',
    'emergency': 'cấp cứu',
    'first aid': 'sơ cứu',
  }
  
  return medicalTranslations[englishTerm.toLowerCase()] || englishTerm
}

// Simple heuristic to check if text is likely English
function isLikelyEnglish(text: string): boolean {
  // Basic check: if most characters are ASCII and contains common English words
  const asciiRatio = text.split('').filter(char => char.charCodeAt(0) < 128).length / text.length
  const commonEnglishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with', 'for', 'as', 'was', 'on', 'are', 'you', 'this', 'be', 'at', 'have']
  const lowerText = text.toLowerCase()
  const englishWordCount = commonEnglishWords.filter(word => lowerText.includes(` ${word} `) || lowerText.startsWith(`${word} `) || lowerText.endsWith(` ${word}`)).length

  // Consider it English if >80% ASCII characters and contains common English words
  return asciiRatio > 0.8 && englishWordCount > 0
}