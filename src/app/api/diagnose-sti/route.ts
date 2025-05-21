
import type { NextRequest } from 'next/server';
import { diagnoseSTI, type DiagnoseSTIInput, type DiagnoseSTIOutput } from '@/ai/flows/diagnose-sti';
import { z } from 'zod';

const DiagnoseSTIRequestSchema = z.object({
  symptoms: z.string().min(1, "Symptoms are required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = DiagnoseSTIRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request body", details: validationResult.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: DiagnoseSTIInput = validationResult.data;
    const result: DiagnoseSTIOutput = await diagnoseSTI(input);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Diagnose STI Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: 'Failed to process STI diagnosis request', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
