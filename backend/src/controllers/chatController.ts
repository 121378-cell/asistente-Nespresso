import { Request, Response } from 'express';
import { generateResponse, identifyMachineFromImage } from '../services/geminiService.js';
import { logger } from '../config/logger.js';

interface MessageInput {
    role: 'user' | 'model';
    text: string;
}

interface FileInput {
    mimeType: string;
    data: string; // base64
}

interface ChatRequest {
    history: MessageInput[];
    message: string;
    file?: FileInput;
    useGoogleSearch?: boolean;
    machineModel?: string | null;
}

interface IdentifyMachineRequest {
    image: string; // base64
}

// POST /api/chat - Generate chat response
export const chat = async (req: Request, res: Response) => {
    try {
        const { history, message, file, useGoogleSearch, machineModel }: ChatRequest = req.body;

        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        if (!Array.isArray(history)) {
            return res.status(400).json({ error: 'History must be an array' });
        }

        // Call Gemini service
        const response = await generateResponse(
            history,
            message,
            file,
            useGoogleSearch,
            machineModel
        );

        // Extract response data
        const text = response.text ?? '';
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        res.json({
            text,
            groundingMetadata: groundingMetadata || undefined,
        });

    } catch (error: any) {
        logger.error({ err: error, message: req.body.message }, 'Failed to generate chat response');
        res.status(500).json({
            error: 'Failed to generate response',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// POST /api/chat/identify-machine - Identify machine from image
export const identifyMachine = async (req: Request, res: Response) => {
    try {
        const { image }: IdentifyMachineRequest = req.body;

        // Validation
        if (!image || typeof image !== 'string') {
            return res.status(400).json({ error: 'Image data is required and must be a base64 string' });
        }

        // Call Gemini service
        const result = await identifyMachineFromImage(image);

        res.json(result);

    } catch (error: any) {
        logger.error({ err: error }, 'Failed to identify machine from image');
        res.status(500).json({
            error: 'Failed to identify machine',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
