
import { Fault } from '../types';

export const faults: Fault[] = [
  // --- ZENIUS Y GENERAL ---
  {
    id: 'lever-stuck',
    symptom: 'Palanca bloqueada / Grupo atascado (Zenius/Gemini)',
    causes: [
      'Bloqueo hidráulico: Cápsula hinchada por presión y calor dentro de la cámara de infusión.',
      'Doble cápsula: Se introdujo una nueva sin caer la anterior, creando un atasco físico.',
      'Mecanismo roto: Engranajes de plástico dañados o biela partida (común en Zenius antiguas).',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Enfriamiento:** Si está caliente, desconecta y espera 20 min. El polímero de la cápsula se contraerá, facilitando la apertura.',
        imagePlaceholder: 'Icono de reloj.',
      },
      {
        step: 2,
        description:
          '**Asistencia manual:** Con máquina desenchufada, usa una herramienta roma para empujar la cápsula desde abajo (por la salida de café) mientras intentas levantar la palanca suavemente. ¡No fuerces la palanca de plástico!',
        imagePlaceholder: 'Esquema de desbloqueo manual.',
      },
    ],
    preventionTips: [
      'Expulsar siempre la cápsula inmediatamente tras el uso.',
      'Lubricar el mecanismo periódicamente.',
    ],
  },
  {
    id: 'pump-noise-no-water',
    symptom: 'Ruido de bomba fuerte pero no sale agua (Airlock)',
    causes: [
      'Airlock: Burbuja de aire en la bomba Ulka tras quedarse el depósito vacío.',
      'Válvula del depósito pegada o filtro de entrada obstruido.',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Cebado manual:** Levanta la palanca. Pulsa botón de café (Lungo). Mientras suena la bomba, mueve la palanca arriba/abajo rítmicamente para generar vacío y ayudar a la bomba a succionar agua.',
        imagePlaceholder: 'Movimiento de palanca.',
      },
      {
        step: 2,
        description:
          '**Gemini:** Si es una Gemini, asegúrate de que el depósito está bien asentado y prueba a intercambiar los depósitos izquierdo/derecho para descartar fallo de válvula de pie.',
      },
    ],
    preventionTips: [
      'No dejar vaciar los depósitos por completo nunca.',
    ],
  },
  
  // --- GEMINI SPECIFIC (CS203 / CS223) ---
  {
    id: 'gemini-milk-froth',
    symptom: '[Gemini CS223] No espuma leche o escupe vapor y leche caliente',
    causes: [
      'Pajita de aspiración dañada: Micro-fisuras en el tubo de plástico impiden el vacío necesario (Efecto Venturi roto).',
      'Boquilla de vapor sucia: Residuos de leche seca en el inyector calibrado.',
      'Caldera de vapor calcificada: El termobloque de vapor está saturado.',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Revisión de Pajas:** Cambia las pajas de plástico y la boquilla de goma negra. Son consumibles (Ref: Kit de Mantenimiento). Si tienen la más mínima grieta o deformación, entra aire y no sube la leche.',
        imagePlaceholder: 'Kit de aspiración de leche.',
      },
      {
        step: 2,
        description:
          '**Limpieza de cabezal:** Desmonta el cabezal de leche completo y sumérgelo en agua muy caliente con detergente desengrasante específico.',
        imagePlaceholder: 'Limpieza de cabezal.',
      },
      {
        step: 3,
        description:
          '**Botón de Limpieza:** Asegúrate de pulsar el botón de "Clean" (Purga) después de cada uso de leche durante 10 segundos para limpiar el conducto interno.',
      },
    ],
    preventionTips: [
      'Usar el kit de mantenimiento de leche regularmente.',
      'Purgar siempre tras cada uso.',
    ],
  },
  {
    id: 'gemini-descale-loop',
    symptom: '[Gemini] Bloqueada en "Descaling" o pide descalcificación constante',
    causes: [
      'Ciclo interrumpido: Se apagó la máquina o se quitó el agua durante el proceso, corrompiendo el estado lógico.',
      'Sonda de nivel sucia: La máquina no detecta que el líquido ha pasado por los caudalímetros.',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Completar ciclo:** Debes repetir el proceso entero. Llena los depósitos con agua limpia. Entra al menú -> Care -> Descaling y deja que termine hasta el final.',
        imagePlaceholder: 'Pantalla Gemini menú Care.',
      },
      {
        step: 2,
        description:
          '**Truco del sensor:** Si se queda en "Rinsing" (Aclarado) eternamente, limpia con alcohol los contactos metálicos en la base donde encajan los depósitos. A veces la humedad crea falsos contactos.',
        imagePlaceholder: 'Contactos del depósito.',
      },
    ],
    preventionTips: [
      'Nunca interrumpas el proceso de descalcificación una vez iniciado (aprox. 15 min).',
    ],
  },

  // --- MOMENTO SPECIFIC ---
  {
    id: 'momento-touch-freeze',
    symptom: '[Momento] Pantalla táctil congelada o negra / No despierta',
    causes: [
      'Bloqueo de software: La telemetría intentó actualizar y falló.',
      'Sensor de proximidad sucio: La máquina cree que no hay nadie y se mantiene en modo Eco.',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Limpieza de sensor:** Pasa un paño húmedo por la franja negra brillante debajo de la pantalla. Ahí están los sensores IR de proximidad.',
        imagePlaceholder: 'Limpiando sensor bajo pantalla.',
      },
      {
        step: 2,
        description:
          '**Reinicio forzado:** Desenchufa la máquina de la corriente. Espera 2 minutos completos (para descargar condensadores de la placa base). Vuelve a enchufar.',
      },
    ],
    preventionTips: [
      'Mantener el frontal de la máquina limpio.',
    ],
  },
  {
    id: 'momento-error-code',
    symptom: '[Momento] Código de error numérico en pantalla (ej: 301, 303, 1xxx)',
    causes: [
      'Error 3xxx: Fallo en el movimiento del grupo (Motor/Engranaje atascado o final de carrera roto).',
      'Error 1xxx: Problema de flujo de agua (Caudalímetro no cuenta pulsos o Bomba no arranca).',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Identificación:** Si es un error 301/303, suele ser una cápsula atascada que impide al motor cerrar el grupo. Busca obstrucciones físicas en el alojamiento.',
        imagePlaceholder: 'Grupo motorizado.',
      },
      {
        step: 2,
        description:
          '**Menú Técnico:** Accede al menú técnico (toque rápido en las 4 esquinas: arr-izq, arr-der, abj-der, abj-izq) y busca el "Error Log" para ver la frecuencia del fallo y realizar un I/O test del motor.',
        imagePlaceholder: 'Patrón de toque en esquinas.',
      },
    ],
    preventionTips: [
      'No meter los dedos ni forzar la entrada de cápsula mientras el motor se mueve.',
    ],
  },
  
  // --- COMMON GENERAL ---
  {
    id: 'cold-coffee',
    symptom: 'Café tibio / No calienta suficiente',
    causes: [
      'Cal incrustada en el Thermoblock (aislante térmico).',
      'Sonda NTC defectuosa (lectura errónea).',
      'Taza fría (roba 10-15ºC al café).',
    ],
    solutionSteps: [
      {
        step: 1,
        description:
          '**Precalentar sistema:** Haz una tirada de solo agua caliente antes de poner la cápsula. Esto calienta tuberías, grupo y taza.',
        imagePlaceholder: 'Agua caliente en taza.',
      },
      {
        step: 2,
        description:
          '**Descalcificación:** Es la causa #1 de baja temperatura. Realiza el ciclo completo con líquido oficial.',
        imagePlaceholder: 'Líquido descalcificante.',
      },
    ],
    preventionTips: [
      'Usar tazas precalentadas (calientatazas).',
    ],
  },
];
