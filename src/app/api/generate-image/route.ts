
import type { NextRequest } from 'next/server';
import { generateIllnessImage, type GenerateIllnessImageInput, type GenerateIllnessImageOutput } from '@/ai/flows/generate-illness-image'; // General image
import { z } from 'zod';

const GenerateImageRequestSchema = z.object({
  illnessName: z.string().min(1, "Illness name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = GenerateImageRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: GenerateIllnessImageInput = validationResult.data;
    const result: GenerateIllnessImageOutput = await generateIllnessImage(input); // Calls general image generation
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Generate Image (General) Error:', error);
    let errorMessage = 'An unexpected error occurred';
    let status = 500;

    if (error.message && (error.message.includes('401') || (error.status && error.status === 401))) {
        errorMessage = 'Authorization failed when trying to contact the AI service for image generation. This is likely due to a missing or invalid API key for Google AI. Please check your .env file or environment configuration in your hosting provider.';
        status = 401;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: 'Failed to generate general image', details: errorMessage }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
