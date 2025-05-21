
import type { NextRequest } from 'next/server';
import { diagnoseIllness, type DiagnoseIllnessInput, type DiagnoseIllnessOutput } from '@/ai/flows/diagnose-illness'; // General diagnosis
import { z } from 'zod';

const DiagnoseRequestSchema = z.object({
  symptoms: z.string().min(1, "Symptoms are required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = DiagnoseRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: DiagnoseIllnessInput = validationResult.data;
    const result: DiagnoseIllnessOutput = await diagnoseIllness(input); // Calls general diagnosis flow

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Diagnose (General) Error:', error);
    let errorMessage = 'An unexpected error occurred';
    let status = 500;

    if (error.message && (error.message.includes('401') || (error.status && error.status === 401))) {
        errorMessage = 'Authorization failed when trying to contact the AI service. This is likely due to a missing or invalid API key for Google AI. Please check your .env file or environment configuration in your hosting provider.';
        status = 401; 
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: 'Failed to process general diagnosis request', details: errorMessage }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
