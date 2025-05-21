// SummarizeSTIInformation.ts
'use server';

/**
 * @fileOverview Provides summarized information about STIs based on user queries.
 *
 * - summarizeSTIInformation - A function that summarizes STI information.
 * - SummarizeSTIInformationInput - The input type for the summarizeSTIInformation function.
 * - SummarizeSTIInformationOutput - The return type for the summarizeSTIInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSTIInformationInputSchema = z.object({
  query: z
    .string()
    .describe('The search query for STI information. For example: Chlamydia.'),
});
export type SummarizeSTIInformationInput = z.infer<
  typeof SummarizeSTIInformationInputSchema
>;

const SummarizeSTIInformationOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summarized explanation of the key information about the STI, including symptoms, treatments, and prevention methods. The summary should be in Spanish.'
    ),
});
export type SummarizeSTIInformationOutput = z.infer<
  typeof SummarizeSTIInformationOutputSchema
>;

export async function summarizeSTIInformation(
  input: SummarizeSTIInformationInput
): Promise<SummarizeSTIInformationOutput> {
  return summarizeSTIInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSTIInformationPrompt',
  input: {schema: SummarizeSTIInformationInputSchema},
  output: {schema: SummarizeSTIInformationOutputSchema},
  prompt: `Proporciona un resumen fácil de entender sobre {{query}}, incluyendo síntomas, tratamientos y métodos de prevención. La respuesta debe estar en español.`, 
});

const summarizeSTIInformationFlow = ai.defineFlow(
  {
    name: 'summarizeSTIInformationFlow',
    inputSchema: SummarizeSTIInformationInputSchema,
    outputSchema: SummarizeSTIInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
