/**
 * Datos de prueba para tests E2E
 */

export const testData = {
  // Modelos de cafeteras de prueba
  machineModels: {
    aguila: 'Aguila',
    zenius: 'Zenius',
    gemini: 'Gemini CS2',
  },

  // Números de serie de prueba
  serialNumbers: {
    aguila: 'AG123456',
    zenius: 'ZE789012',
    gemini: 'GM345678',
  },

  // Mensajes de chat de prueba
  chatMessages: {
    greeting: 'Hola',
    modelIdentification: 'Tengo una cafetera Aguila',
    problem: 'La cafetera no enciende',
    searchQuery: 'problemas con bomba de agua',
  },

  // Problemas comunes
  commonProblems: ['No enciende', 'No sale café', 'Fugas de agua', 'Error en pantalla'],

  // Datos de reparación de prueba
  repair: {
    title: 'Test Repair - Aguila',
    description: 'Reparación de prueba para tests E2E',
    model: 'Aguila',
    serialNumber: 'TEST-001',
  },
};

export const selectors = {
  // Header
  header: {
    title: 'h1:has-text("Asistente de Reparacion Nespresso")',
    videoButton: 'button[title*="video"], button:has-text("Crear Video")',
    repairsButton: 'button[title*="Reparaciones Guardadas"]',
    databaseButton: 'button[title*="Base de Datos"]',
  },

  // Chat
  chat: {
    input: 'input[aria-label*="Escribe tu mensaje"]',
    sendButton: 'button[aria-label="Enviar mensaje"]',
    messages: '[class*="rounded-bl-none"], [class*="rounded-br-none"]',
    loadingSpinner: '[class*="loading"]',
  },

  // Knowledge Base
  knowledgeBase: {
    container: '[class*="knowledge"]',
    problemCard: '[class*="problem"]',
  },

  // Modals
  modals: {
    videoGenerator: '[class*="modal"]:has-text("Video")',
    savedRepairs: '[class*="modal"]:has-text("Reparaciones")',
    database: '[class*="modal"]:has-text("Base de Datos")',
    camera: '[class*="modal"]:has-text("cámara")',
    closeButton: 'button:has-text("Cerrar")',
  },

  // Camera
  camera: {
    button: 'button:has-text("Usar cámara")',
  },
};
