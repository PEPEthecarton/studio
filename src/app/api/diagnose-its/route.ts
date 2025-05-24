
import type { NextRequest } from 'next/server';
import { diagnoseITS, type DiagnoseITSInput, type DiagnoseITSOutput } from '@/ai/flows/diagnose-its';
import { z } from 'zod';

const DiagnoseITSRequestSchema = z.object({
  symptoms: z.string().min(1, "Symptoms are required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = DiagnoseITSRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: DiagnoseITSInput = validationResult.data;
    const result: DiagnoseITSOutput = await diagnoseITS(input);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('API Diagnose ITS Error:', error);
    let errorMessage = 'An unexpected error occurred';
    let status = 500;

    if (error.message && (error.message.includes('401') || (error.status && error.status === 401))) {
        errorMessage = 'Authorization failed when trying to contact the AI service for ITS diagnosis. This is likely due to a missing or invalid API key for Google AI. Please check your .env file or environment configuration in your hosting provider.';
        status = 401;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ error: 'Failed to process ITS diagnosis request', details: errorMessage }), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
