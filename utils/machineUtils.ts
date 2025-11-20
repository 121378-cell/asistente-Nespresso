
/**
 * Intenta analizar un número de serie para determinar el modelo de la cafetera.
 * Basado en la documentación de Nespresso Profesional.
 * @param serial El número de serie introducido por el usuario.
 * @returns Un objeto con el modelo y el serial saneado, o null si no es válido.
 */
export function parseSerialNumber(serial: string): { model: string; serial: string } | null {
  if (!serial) return null;
  
  // Sanitize: remove spaces and convert to uppercase.
  const sanitizedSerial = serial.replace(/\s+/g, '').toUpperCase();

  // Basic validation: Nespresso serials are usually 19 digits, but specifically checks index 5 for Pro machines.
  if (sanitizedSerial.length < 6) {
    return null;
  }

  // The 5th index (6th character) typically indicates machine family in some Pro models
  // Note: This is a heuristic based on Nespresso Pro patterns (e.g., 10052Z...)
  const modelCode = sanitizedSerial.charAt(5);

  // Map of known model codes to full model names.
  const modelMap: { [key: string]: string } = {
    'Z': 'Zenius ZN 100 PRO',
    'C': 'Gemini CS 203/223', // Classic Gemini code
    'G': 'Gemini CS 203/223', // Some variants
    'M': 'Nespresso Momento', // Momento family
    'N': 'Nespresso Momento', // Momento variant
    'E': 'Nespresso Momento', // Momento 100/200 often use E or similar in some regions
  };

  if (modelMap[modelCode]) {
    return {
      model: modelMap[modelCode],
      serial: sanitizedSerial,
    };
  }

  // Fallback logic for specific substrings if the char code match fails
  if (sanitizedSerial.includes('CS200') || sanitizedSerial.includes('CS220')) {
      return { model: 'Gemini CS 203/223', serial: sanitizedSerial };
  }
  if (sanitizedSerial.includes('ZN100')) {
      return { model: 'Zenius ZN 100 PRO', serial: sanitizedSerial };
  }

  return null;
}
