
'use server';
/**
 * @fileOverview Flow para generar una imagen informativa relacionada con una Infección de Transmisión Sexual (ITS) específica.
 *
 * - generateITSImage - Una función que maneja el proceso de generación de imágenes de ITS.
 * - GenerateITSImageInput - El tipo de entrada para la función generateITSImage.
 * - GenerateITSImageOutput - El tipo de retorno para la función generateITSImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateITSImageInputSchema = z.object({
  itsName: z.string().describe('El nombre de la ITS para la cual generar una imagen.'),
});
export type GenerateITSImageInput = z.infer<typeof GenerateITSImageInputSchema>;

const GenerateITSImageOutputSchema = z.object({
  imageUrl: z.string().describe('La data URI de la imagen generada.'),
});
export type GenerateITSImageOutput = z.infer<typeof GenerateITSImageOutputSchema>;

export async function generateITSImage(input: GenerateITSImageInput): Promise<GenerateITSImageOutput> {
  return generateITSImageFlow(input);
}

const imagePromptText = (itsName: string) => `Generate an **educational and highly stylized illustration** that represents a key concept associated with the Sexually Transmitted Infection (STI/ITS): "${itsName}".
The image must be suitable for sexual health education, **strictly avoiding any graphic, explicit, sexually suggestive, or disturbing clinical content, and avoiding detailed anatomical representations**.
Focus on an artistic, symbolic, or conceptual illustration. This could relate to an abstract representation of common symptoms (stylized and non-graphic), the importance of testing, prevention methods (e.g., symbols of protection), or the impact on health.
Do NOT show human anatomy in a clinical or detailed way. The image must be appropriate for a general audience and avoid showing the pathogen (virus/bacteria) itself unless specifically asked for a microscopic view. The aim is to be informative and discreet.`;

const generateITSImageFlow = ai.defineFlow(
  {
    name: 'generateITSImageFlow',
    inputSchema: GenerateITSImageInputSchema,
    outputSchema: GenerateITSImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePromptText(input.itsName),
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [ 
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' }, // Stricter for ITS images
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      },
    });

    if (!media.url) {
        throw new Error('ITS Image generation failed or returned no URL.');
    }
    return {imageUrl: media.url};
  }
);

