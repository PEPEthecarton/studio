
import type { NextRequest } from 'next/server';
import { generateSTIImage, type GenerateSTIImageInput, type GenerateSTIImageOutput } from '@/ai/flows/generate-sti-image';
import { z } from 'zod';

const GenerateSTIImageRequestSchema = z.object({
  stiName: z.string().min(1, "STI name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = GenerateSTIImageRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: GenerateSTIImageInput = { stiName: body.stiName || body.illnessName }; // Accepts stiName or illnessName from body
    const result: GenerateSTIImageOutput = await generateSTIImage(input);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Generate STI Image Error:', error);
    let errorMessage = 'An unexpected error occurred';
    let status = 500;

    if (error.message && (error.message.includes('401') || (error.status && error.status === 401))) {
        errorMessage = 'Authorization failed when trying to contact the AI service for STI image generation. This is likely due to a missing or invalid API key for Google AI. Please check your .env file or environment configuration in your hosting provider.';
        status = 401;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: 'Failed to generate STI image', details: errorMessage }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
