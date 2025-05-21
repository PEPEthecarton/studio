
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

    // Adapt input key if necessary, GenerateSTIImageInput expects `stiName`
    const input: GenerateSTIImageInput = { stiName: body.illnessName || body.stiName }; 
    const result: GenerateSTIImageOutput = await generateSTIImage(input);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Generate STI Image Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: 'Failed to generate STI image', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
