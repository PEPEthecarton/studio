
'use server';
/**
 * @fileOverview Flow para generar una imagen informativa relacionada con una Enfermedad de Transmisión Sexual (ETS) específica.
 *
 * - generateSTIImage - Una función que maneja el proceso de generación de imágenes de ETS.
 * - GenerateSTIImageInput - El tipo de entrada para la función generateSTIImage.
 * - GenerateSTIImageOutput - El tipo de retorno para la función generateSTIImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSTIImageInputSchema = z.object({
  stiName: z.string().describe('El nombre de la ETS para la cual generar una imagen.'),
});
export type GenerateSTIImageInput = z.infer<typeof GenerateSTIImageInputSchema>;

const GenerateSTIImageOutputSchema = z.object({
  imageUrl: z.string().describe('La data URI de la imagen generada.'),
});
export type GenerateSTIImageOutput = z.infer<typeof GenerateSTIImageOutputSchema>;

export async function generateSTIImage(input: GenerateSTIImageInput): Promise<GenerateSTIImageOutput> {
  return generateSTIImageFlow(input);
}

const imagePromptText = (stiName: string) => `Generate an informative and abstract educational image related to the Sexually Transmitted Infection (STI): "${stiName}". The image should be suitable for sexual health education, avoiding graphic, explicit or disturbing content. Focus on conceptual or symbolic representation. For example, microscopic views of pathogens, abstract representations of transmission, or symbols of health and prevention.`;

const generateSTIImageFlow = ai.defineFlow(
  {
    name: 'generateSTIImageFlow',
    inputSchema: GenerateSTIImageInputSchema,
    outputSchema: GenerateSTIImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePromptText(input.stiName),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [ // Potentially more permissive for educational STI content if needed, but start strict.
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      },
    });

    if (!media.url) {
        throw new Error('STI Image generation failed or returned no URL.');
    }
    return {imageUrl: media.url};
  }
);
