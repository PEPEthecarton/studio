
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
  } catch (error) {
    console.error('API Generate Image (General) Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate general image', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
