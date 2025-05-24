
import type { NextRequest } from 'next/server';
import { generateITSImage, type GenerateITSImageInput, type GenerateITSImageOutput } from '@/ai/flows/generate-its-image';
import { z } from 'zod';

const GenerateITSImageRequestSchema = z.object({
  itsName: z.string().min(1, "ITS name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = GenerateITSImageRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Accepts itsName or falls back to illnessName for broader compatibility if old clients call it
    const input: GenerateITSImageInput = { itsName: body.itsName || body.illnessName }; 
    const result: GenerateITSImageOutput = await generateITSImage(input);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Generate ITS Image Error:', error);
    let errorMessage = 'An unexpected error occurred';
    let status = 500;

    if (error.message && (error.message.includes('401') || (error.status && error.status === 401))) {
        errorMessage = 'Authorization failed when trying to contact the AI service for ITS image generation. This is likely due to a missing or invalid API key for Google AI. Please check your .env file or environment configuration in your hosting provider.';
        status = 401;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: 'Failed to generate ITS image', details: errorMessage }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
