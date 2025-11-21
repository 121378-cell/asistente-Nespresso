"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = generateResponse;
exports.identifyMachineFromImage = identifyMachineFromImage;
var genai_1 = require("@google/genai");
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var SYSTEM_INSTRUCTION = "Eres un compa\u00F1ero experto en reparaci\u00F3n de cafeteras Nespresso Profesional. Tu especialidad abarca las gamas: **ZENIUS (ZN100)**, **GEMINI (CS203/CS223)** y **MOMENTO (80/100/200)**. Act\u00FAas como un t\u00E9cnico senior guiando a un compa\u00F1ero.\n\nTus Principios Fundamentales:\n\n1.  **SEGURIDAD (PRIORIDAD #1):**\n    *   **\u00A1ALTO! \uD83D\uDED1**: Antes de abrir cualquier m\u00E1quina (especialmente las Gemini que tienen 2 calderas o la Momento que tiene alto voltaje en placa), exige desconexi\u00F3n el\u00E9ctrica.\n    *   Advertencia: La CS223 tiene caldera de vapor a presi\u00F3n. Peligro de quemaduras graves.\n\n2.  **L\u00D3GICA DEDUCTIVA MULTI-MODELO:**\n    *   **Zenius:** Compacta. Falla por bloqueos mec\u00E1nicos y fusibles t\u00E9rmicos. Usa checklists estrictos de presi\u00F3n (19bar).\n    *   **Gemini (CS203/223):** Doble cabezal. Si un lado funciona y el otro no, el problema es local (v\u00E1lvula de ese lado/bomba de ese lado). Si nada funciona, es central (Placa/Fuente).\n        *   *CS223:* Problemas de leche = Pajas de aspiraci\u00F3n fisuradas o boquillas sucias (99% de los casos).\n    *   **Momento:** Electr\u00F3nica avanzada. Se basa en c\u00F3digos de error en pantalla y sensores de proximidad. El \"Caudal\u00EDmetro\" (Flowmeter) y el Grupo Motorizado son los puntos de fallo cr\u00EDticos.\n\n3.  **SOLUCIONES DE HARDWARE Y SOFTWARE:**\n    *   Usa nombres t\u00E9cnicos: Bomba Fluid-o-Tech (Gemini), Bomba Ulka (Zenius), M\u00F3dulo de Leche (Cappuccinatore), Unidad de Infusi\u00F3n (Brewing Unit), Thermoblock.\n\n---\n\n### MANUAL T\u00C9CNICO: BASE DE DATOS EXPANDIDA\n\n#### A. ZENIUS ZN 100 PRO (Resumen)\n*   **Luces:** Rojo fijo = Error NTC/Placa. Descalcificaci\u00F3n parpadeando = Modo activo.\n*   **Checklist de Mantenimiento:** Revisa siempre la junta retenedora (color rojo/negro) y las 16 juntas t\u00F3ricas internas.\n*   **Reset:** Lungo + Ristretto + Power.\n\n#### B. GEMINI CS 200 / CS 220 (CS203/CS223)\n*   **Arquitectura:** Doble cabezal independiente. Dep\u00F3sito de agua doble (3L cada uno).\n*   **Fallo Cl\u00E1sico - \"Machine Locked / Descaling Needed\":** Bloqueo por falta de descalcificaci\u00F3n.\n*   **Modo T\u00E9cnico (Menu):** Presionar bot\u00F3n central (dial) durante 3 seg.\n    *   **Modo Descalcificaci\u00F3n:** Men\u00FA -> Care -> Descaling.\n*   **Problemas de Leche (Solo CS223):**\n    *   Si escupe vapor pero no espuma: Boquilla de aspiraci\u00F3n (la paja) tiene una micro-fisura (efecto Venturi roto). Reemplazar.\n    *   Si no sale nada: Bloqueo de cal en la caldera de vapor dedicada.\n\n#### C. NESPRESSO MOMENTO (80/100/120/200)\n*   **Interfaz:** Pantalla T\u00E1ctil.\n*   **C\u00F3digos de Error Comunes:**\n    *   **Error 3xxx (301, 303):** Problemas de Grupo/Motor (El grupo no cierra/abre por obstrucci\u00F3n).\n    *   **Error 1xxx (104, 106):** Problemas Hidr\u00E1ulicos (Caudal\u00EDmetro calcificado o Bomba fatigada).\n*   **Modo T\u00E9cnico (Hidden Menu):**\n    *   Tocar las 4 esquinas de la pantalla t\u00E1ctil en orden r\u00E1pido: Arr-Izq -> Arr-Der -> Abj-Der -> Abj-Izq.\n    *   Permite ver \"Error Log\" y hacer \"I/O Test\" de componentes.\n*   **Sensores:** Si la m\u00E1quina no despierta, limpiar el sensor IR bajo la pantalla.\n\nRecuerda: Pregunta siempre el modelo si no lo sabes. Adapta tu lenguaje: Con una Gemini habla de \"Cabezal Izquierdo/Derecho\". Con una Momento habla de \"Pantalla\" y \"C\u00F3digos\".";
function generateResponse(history, message, file, useGoogleSearch, machineModel) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, ai, modelName, parts, contents, finalSystemInstruction, tools, config, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    apiKey = process.env.GEMINI_API_KEY;
                    if (!apiKey) {
                        throw new Error('GEMINI_API_KEY not configured in backend');
                    }
                    ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
                    modelName = useGoogleSearch ? 'gemini-2.5-flash'
                        : (file === null || file === void 0 ? void 0 : file.mimeType.startsWith('image/')) ? 'gemini-2.5-flash'
                            : (file === null || file === void 0 ? void 0 : file.mimeType.startsWith('video/')) ? 'gemini-2.5-pro'
                                : 'gemini-2.5-pro';
                    parts = [{ text: message }];
                    if (file) {
                        parts.unshift({
                            inlineData: {
                                mimeType: file.mimeType,
                                data: file.data,
                            },
                        });
                    }
                    contents = history.map(function (msg) { return ({
                        role: msg.role,
                        parts: [{ text: msg.text }]
                    }); });
                    // Add current message
                    contents.push({ role: 'user', parts: parts });
                    finalSystemInstruction = SYSTEM_INSTRUCTION;
                    if (machineModel) {
                        finalSystemInstruction += "\n\nIMPORTANTE: El usuario est\u00E1 trabajando con una cafetera modelo \"".concat(machineModel, "\". Aseg\u00FArate de que todas tus respuestas, diagn\u00F3sticos y pasos de reparaci\u00F3n sean espec\u00EDficos para este modelo. Si no conoces el modelo, dilo honestamente, pero intenta dar una respuesta general basada en principios comunes de las Nespresso Profesional.");
                    }
                    tools = [];
                    if (useGoogleSearch) {
                        tools.push({ googleSearch: {} });
                    }
                    config = {
                        systemInstruction: finalSystemInstruction,
                    };
                    if (tools.length > 0) {
                        config.tools = tools;
                    }
                    return [4 /*yield*/, ai.models.generateContent({
                            model: modelName,
                            contents: contents,
                            config: config
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error calling Gemini API:', error_1);
                    throw new Error('Failed to generate response from Gemini');
                case 3: return [2 /*return*/];
            }
        });
    });
}
function identifyMachineFromImage(base64Image) {
    return __awaiter(this, void 0, void 0, function () {
        var apiKey, ai, imagePart, textPart, response, jsonText, result, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    apiKey = process.env.GEMINI_API_KEY;
                    if (!apiKey) {
                        throw new Error('GEMINI_API_KEY not configured in backend');
                    }
                    ai = new genai_1.GoogleGenAI({ apiKey: apiKey });
                    imagePart = {
                        inlineData: {
                            mimeType: 'image/jpeg',
                            data: base64Image,
                        },
                    };
                    textPart = {
                        text: "Analiza esta imagen de una cafetera. Identifica el modelo exacto y el n\u00FAmero de serie. El n\u00FAmero de serie suele estar en una pegatina con un c\u00F3digo de barras. Responde con un JSON que se ajuste al esquema proporcionado. Si no encuentras uno de los campos, d\u00E9jalo como un string vac\u00EDo.",
                    };
                    return [4 /*yield*/, ai.models.generateContent({
                            model: 'gemini-2.5-flash',
                            contents: [{ role: 'user', parts: [imagePart, textPart] }],
                            config: {
                                responseMimeType: 'application/json',
                                responseSchema: {
                                    type: genai_1.Type.OBJECT,
                                    properties: {
                                        model: {
                                            type: genai_1.Type.STRING,
                                            description: 'El nombre del modelo de la cafetera. Por ejemplo: "Zenius ZN 100 PRO".'
                                        },
                                        serialNumber: {
                                            type: genai_1.Type.STRING,
                                            description: 'El número de serie completo de la cafetera.'
                                        },
                                    },
                                    required: ['model', 'serialNumber'],
                                },
                            },
                        })];
                case 1:
                    response = _b.sent();
                    jsonText = (_a = response.text) === null || _a === void 0 ? void 0 : _a.trim();
                    if (!jsonText)
                        throw new Error('Empty response from Gemini');
                    result = void 0;
                    try {
                        result = JSON.parse(jsonText);
                    }
                    catch (e) {
                        console.error('Failed to parse JSON response from Gemini:', jsonText);
                        throw new Error('Invalid JSON response from Gemini');
                    }
                    if (result && typeof result.model === 'string' && typeof result.serialNumber === 'string') {
                        return [2 /*return*/, result];
                    }
                    else {
                        throw new Error('Unexpected response format from Gemini');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error('Error identifying machine from image:', error_2);
                    throw new Error('Failed to identify machine from image');
                case 3: return [2 /*return*/];
            }
        });
    });
}
