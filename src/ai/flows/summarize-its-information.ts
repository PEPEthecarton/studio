
// SummarizeITSInformation.ts
'use server';

/**
 * @fileOverview Provides summarized information about ITS based on user queries.
 *
 * - summarizeITSInformation - A function that summarizes ITS information.
 * - SummarizeITSInformationInput - The input type for the summarizeITSInformation function.
 * - SummarizeITSInformationOutput - The return type for the summarizeITSInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeITSInformationInputSchema = z.object({
  query: z
    .string()
    .describe('The search query for ITS information. For example: Clamidia.'),
});
export type SummarizeITSInformationInput = z.infer<
  typeof SummarizeITSInformationInputSchema
>;

const SummarizeITSInformationOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summarized explanation of the key information about the ITS, including symptoms, treatments, and prevention methods. The summary should be in Spanish.'
    ),
});
export type SummarizeITSInformationOutput = z.infer<
  typeof SummarizeITSInformationOutputSchema
>;

export async function summarizeITSInformation(
  input: SummarizeITSInformationInput
): Promise<SummarizeITSInformationOutput> {
  return summarizeITSInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeITSInformationPrompt',
  input: {schema: SummarizeITSInformationInputSchema},
  output: {schema: SummarizeITSInformationOutputSchema},
  prompt: `Proporciona un resumen fácil de entender sobre {{query}} (una Infección de Transmisión Sexual), incluyendo síntomas, tratamientos y métodos de prevención. La respuesta debe estar en español.`, 
});

const summarizeITSInformationFlow = ai.defineFlow(
  {
    name: 'summarizeITSInformationFlow',
    inputSchema: SummarizeITSInformationInputSchema,
    outputSchema: SummarizeITSInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

