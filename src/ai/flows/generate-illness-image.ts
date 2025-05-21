
'use server';
/**
 * @fileOverview Flow para generar una imagen informativa relacionada con una enfermedad específica.
 *
 * - generateIllnessImage - Una función que maneja el proceso de generación de imágenes de enfermedades.
 * - GenerateIllnessImageInput - El tipo de entrada para la función generateIllnessImage.
 * - GenerateIllnessImageOutput - El tipo de retorno para la función generateIllnessImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIllnessImageInputSchema = z.object({
  illnessName: z.string().describe('El nombre de la enfermedad para la cual generar una imagen.'),
});
export type GenerateIllnessImageInput = z.infer<typeof GenerateIllnessImageInputSchema>;

const GenerateIllnessImageOutputSchema = z.object({
  imageUrl: z.string().describe('La data URI de la imagen generada.'),
});
export type GenerateIllnessImageOutput = z.infer<typeof GenerateIllnessImageOutputSchema>;

export async function generateIllnessImage(input: GenerateIllnessImageInput): Promise<GenerateIllnessImageOutput> {
  return generateIllnessImageFlow(input);
}

// Note: Image generation prompts are often better in English for current models
const imagePromptText = (illnessName: string) => `Generate an informative and abstract educational image related to the medical condition: "${illnessName}". The image should be suitable for general health education, avoiding graphic or disturbing content. Focus on conceptual or symbolic representation if possible.`;

const generateIllnessImageFlow = ai.defineFlow(
  {
    name: 'generateIllnessImageFlow',
    inputSchema: GenerateIllnessImageInputSchema,
    outputSchema: GenerateIllnessImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Model capable of image generation
      prompt: imagePromptText(input.illnessName),
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include TEXT and IMAGE
        safetySettings: [ // Adjust safety settings if needed, e.g., for medical topics
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      },
    });

    if (!media.url) {
        throw new Error('Image generation failed or returned no URL.');
    }
    return {imageUrl: media.url};
  }
);
