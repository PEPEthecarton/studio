// 'use server';

/**
 * @fileOverview Flow to generate an informative image related to a specific STI for educational purposes.
 *
 * - generateSTIImage - A function that handles the STI image generation process.
 * - GenerateSTIImageInput - The input type for the generateSTIImage function.
 * - GenerateSTIImageOutput - The return type for the generateSTIImage function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSTIImageInputSchema = z.object({
  stiName: z.string().describe('The name of the STI for which to generate an image.'),
});
export type GenerateSTIImageInput = z.infer<typeof GenerateSTIImageInputSchema>;

const GenerateSTIImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateSTIImageOutput = z.infer<typeof GenerateSTIImageOutputSchema>;

export async function generateSTIImage(input: GenerateSTIImageInput): Promise<GenerateSTIImageOutput> {
  return generateSTIImageFlow(input);
}

const generateSTIImagePrompt = ai.definePrompt({
  name: 'generateSTIImagePrompt',
  input: {schema: GenerateSTIImageInputSchema},
  output: {schema: GenerateSTIImageOutputSchema},
  prompt: `Generate an informative image related to {{stiName}} for educational purposes.  The image should be suitable for inclusion in educational materials about STIs.`,
});

const generateSTIImageFlow = ai.defineFlow(
  {
    name: 'generateSTIImageFlow',
    inputSchema: GenerateSTIImageInputSchema,
    outputSchema: GenerateSTIImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Generate an informative image related to ${input.stiName} for educational purposes. The image should be suitable for inclusion in educational materials about STIs.`, // Corrected prompt
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {imageUrl: media.url!};
  }
);
