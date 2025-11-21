import { Request, Response } from 'express';
import { generateVideo, checkVideoStatus } from '../services/geminiService.js';

interface GenerateVideoRequest {
    prompt: string;
    image: {
        imageBytes: string;
        mimeType: string;
    };
    aspectRatio: '16:9' | '9:16';
}

interface CheckVideoStatusRequest {
    operation: any;
}

// POST /api/video/generate - Generate video from image and prompt
export const generate = async (req: Request, res: Response) => {
    try {
        const { prompt, image, aspectRatio }: GenerateVideoRequest = req.body;

        // Validation
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string' });
        }

        if (!image || !image.imageBytes || !image.mimeType) {
            return res.status(400).json({ error: 'Image data is required with imageBytes and mimeType' });
        }

        if (!aspectRatio || !['16:9', '9:16'].includes(aspectRatio)) {
            return res.status(400).json({ error: 'AspectRatio must be either "16:9" or "9:16"' });
        }

        // Call Gemini service
        const operation = await generateVideo(prompt, image, aspectRatio);

        res.json(operation);

    } catch (error: any) {
        console.error('Error in generate video controller:', error);
        res.status(500).json({
            error: 'Failed to generate video',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// POST /api/video/status - Check video generation status
export const status = async (req: Request, res: Response) => {
    try {
        const { operation }: CheckVideoStatusRequest = req.body;

        // Validation
        if (!operation) {
            return res.status(400).json({ error: 'Operation data is required' });
        }

        // Call Gemini service
        const result = await checkVideoStatus(operation);

        res.json(result);

    } catch (error: any) {
        console.error('Error in check video status controller:', error);
        res.status(500).json({
            error: 'Failed to check video status',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
