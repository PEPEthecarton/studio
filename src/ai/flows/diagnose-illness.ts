
'use server';
/**
 * @fileOverview Un asistente de IA para pre-diagnóstico médico basado en síntomas.
 *
 * - diagnoseIllness - Una función que analiza síntomas y sugiere posibles condiciones.
 * - DiagnoseIllnessInput - El tipo de entrada para la función diagnoseIllness.
 * - DiagnoseIllnessOutput - El tipo de retorno para la función diagnoseIllness.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseIllnessInputSchema = z.object({
  symptoms: z.string().describe('Una descripción de los síntomas que el usuario está experimentando.'),
});
export type DiagnoseIllnessInput = z.infer<typeof DiagnoseIllnessInputSchema>;

const DiagnoseIllnessOutputSchema = z.object({
  diagnosisSummary: z
    .string()
    .describe(
      'Un resumen de posibles condiciones médicas basadas en los síntomas, escrito en español. Debe incluir una advertencia muy clara de que esto no es un diagnóstico médico y que el usuario DEBE consultar a un médico.'
    ),
  potentialIllnessName: z
    .string()
    .describe(
      'El nombre de la enfermedad potencial más probable identificada (en español), que se puede usar para la generación de imágenes. Vacío si no se identifica ninguna enfermedad específica.'
    ),
  importantWarning: z
    .string()
    .describe('Una advertencia fija y destacada sobre la necesidad de consultar a un profesional médico.')
});
export type DiagnoseIllnessOutput = z.infer<typeof DiagnoseIllnessOutputSchema>;

export async function diagnoseIllness(input: DiagnoseIllnessInput): Promise<DiagnoseIllnessOutput> {
  return diagnoseIllnessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseIllnessPrompt',
  input: {schema: DiagnoseIllnessInputSchema},
  output: {schema: DiagnoseIllnessOutputSchema},
  prompt: `Eres un asistente virtual de pre-diagnóstico médico. Un usuario describirá sus síntomas.
Analiza los síntomas proporcionados y ofrece un resumen de posibles condiciones o áreas generales de preocupación.
Es CRUCIAL que enfatices MUY CLARAMENTE y en múltiples ocasiones que esto NO es un diagnóstico médico real, que NO REEMPLAZA la consulta con un profesional de la salud, y que el usuario DEBE CONSULTAR A UN MÉDICO para obtener un diagnóstico preciso y cualquier tratamiento.
Si, y solo si, los síntomas apuntan claramente a una condición potencial común y reconocible, puedes mencionar su nombre en español en el campo 'potentialIllnessName'. Si no estás seguro o los síntomas son vagos, deja 'potentialIllnessName' vacío.
Tu respuesta principal debe estar en 'diagnosisSummary'.
El campo 'importantWarning' debe contener el siguiente texto EXACTO: "IMPORTANTE: Este análisis es generado por una IA y NO SUSTITUYE una consulta médica profesional. Los síntomas pueden ser indicativos de diversas condiciones. DEBES CONSULTAR A UN MÉDICO para obtener un diagnóstico preciso y un plan de tratamiento adecuado."
Proporciona toda la información en español.

Síntomas del usuario: {{{symptoms}}}
`,
});

const diagnoseIllnessFlow = ai.defineFlow(
  {
    name: 'diagnoseIllnessFlow',
    inputSchema: DiagnoseIllnessInputSchema,
    outputSchema: DiagnoseIllnessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the fixed warning is always part of the output, overriding any LLM generation for it.
    return {
        diagnosisSummary: output?.diagnosisSummary || "No se pudo procesar la solicitud. Por favor, intente de nuevo.",
        potentialIllnessName: output?.potentialIllnessName || "",
        importantWarning: "IMPORTANTE: Este análisis es generado por una IA y NO SUSTITUYE una consulta médica profesional. Los síntomas pueden ser indicativos de diversas condiciones. DEBES CONSULTAR A UN MÉDICO para obtener un diagnóstico preciso y un plan de tratamiento adecuado."
    };
  }
);
