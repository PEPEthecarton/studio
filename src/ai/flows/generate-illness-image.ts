
'use server';
/**
 * @fileOverview Flow para generar una imagen informativa relacionada con una enfermedad o condición médica GENERAL.
 *
 * - generateIllnessImage - Una función que maneja el proceso de generación de imágenes de enfermedades generales.
 * - GenerateIllnessImageInput - El tipo de entrada para la función generateIllnessImage.
 * - GenerateIllnessImageOutput - El tipo de retorno para la función generateIllnessImage.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIllnessImageInputSchema = z.object({
  illnessName: z.string().describe('El nombre de la enfermedad o condición general para la cual generar una imagen.'),
});
export type GenerateIllnessImageInput = z.infer<typeof GenerateIllnessImageInputSchema>;

const GenerateIllnessImageOutputSchema = z.object({
  imageUrl: z.string().describe('La data URI de la imagen generada.'),
});
export type GenerateIllnessImageOutput = z.infer<typeof GenerateIllnessImageOutputSchema>;

export async function generateIllnessImage(input: GenerateIllnessImageInput): Promise<GenerateIllnessImageOutput> {
  return generateIllnessImageFlow(input);
}

const imagePromptText = (illnessName: string) => `Generate an **educational and stylized illustration** that conceptually represents the common experience or key symptoms of the general medical condition: "${illnessName}".
The image should be suitable for health education, **strictly avoiding graphic, disturbing, or explicit clinical content**.
Focus on an artistic, informative, and recognizable visual metaphor or stylized representation of the condition or its effects, rather than a purely abstract pattern.
For example, for 'flu', it could be a stylized person feeling unwell, or symbols representing fever and cough.
The image must be appropriate for a general audience and not overly abstract to the point of being uninterpretable.`;

const generateIllnessImageFlow = ai.defineFlow(
  {
    name: 'generateGeneralIllnessImageFlow',
    inputSchema: GenerateIllnessImageInputSchema,
    outputSchema: GenerateIllnessImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: imagePromptText(input.illnessName),
      config: {
        responseModalities: ['TEXT', 'IMAGE'], 
        safetySettings: [ 
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }, 
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      },
    });

    if (!media.url) {
        throw new Error('Image generation failed or returned no URL.');
    }
    return {imageUrl: media.url};
  }
);
