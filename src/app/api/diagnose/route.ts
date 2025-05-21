
import type { NextRequest, NextResponse } from 'next/server';
import { diagnoseIllness, type DiagnoseIllnessInput, type DiagnoseIllnessOutput } from '@/ai/flows/diagnose-illness';
import { z } from 'zod';

// Define el esquema de entrada usando Zod para validación
const DiagnoseRequestSchema = z.object({
  symptoms: z.string().min(1, "Symptoms are required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar el cuerpo de la solicitud
    const validationResult = DiagnoseRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: DiagnoseIllnessInput = validationResult.data;
    const result: DiagnoseIllnessOutput = await diagnoseIllness(input);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Diagnose Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: 'Failed to process diagnosis request', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
