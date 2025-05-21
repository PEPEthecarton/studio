
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
      'Un análisis detallado en español. Primero, si se identifica una condición probable, describe sus síntomas comunes. Luego, menciona otras condiciones con síntomas similares. Después, proporciona un resumen general basado en los síntomas del usuario. Incluye recomendaciones para buscar información adicional en fuentes médicas confiables (ej. sitios de organizaciones de salud). Finalmente, DEBE CONCLUIR con una advertencia clara de que esto no es un diagnóstico médico y que el usuario DEBE consultar a un médico.'
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
  prompt: `Eres un asistente virtual de pre-diagnóstico médico con un enfoque informativo y educativo. Un usuario describirá sus síntomas.
Tu objetivo es proporcionar una respuesta estructurada y útil en español. Sigue estos pasos en tu respuesta para el campo 'diagnosisSummary':

1.  **Análisis de Condición Potencial:** Si basándote en los síntomas, identificas una condición médica común y reconocible como la más probable (asígnala a 'potentialIllnessName'), comienza describiendo brevemente los síntomas típicos de *esa* condición. Si no puedes identificar una condición específica con razonable certeza, omite este paso y deja 'potentialIllnessName' vacío.

2.  **Condiciones Similares:** Menciona brevemente 1-2 otras condiciones que podrían presentar síntomas parecidos a los descritos por el usuario, para ampliar la perspectiva.

3.  **Resumen General del Pre-Diagnóstico:** Proporciona un resumen general basado en el análisis de los síntomas específicos que el usuario ha ingresado.

4.  **Búsqueda de Información Confiable:** Si has identificado una 'potentialIllnessName', sugiere al usuario buscar más información sobre esa condición (y sobre salud sexual en general si es relevante para los síntomas) en fuentes médicas confiables y reconocidas, como sitios web de organizaciones de salud gubernamentales o internacionales (por ejemplo, la Organización Mundial de la Salud, o autoridades sanitarias de México).

5.  **Advertencia Final (CRUCIAL):** El 'diagnosisSummary' DEBE CONCLUIR INVARIABLEMENTE con la siguiente frase o una muy similar y clara: "Recuerda, esta información es solo orientativa y educativa, y de ninguna manera sustituye un diagnóstico médico profesional. Es fundamental que consultes a un médico para una evaluación precisa y cualquier tratamiento necesario."

El campo 'importantWarning' debe ser un texto fijo (ver la definición del schema, no lo generes aquí, se asignará después).
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
        diagnosisSummary: output?.diagnosisSummary || "No se pudo procesar la solicitud. Por favor, intente de nuevo. Recuerde consultar a un médico.",
        potentialIllnessName: output?.potentialIllnessName || "",
        importantWarning: "IMPORTANTE: Este análisis es generado por una IA y NO SUSTITUYE una consulta médica profesional. Los síntomas pueden ser indicativos de diversas condiciones. DEBES CONSULTAR A UN MÉDICO para obtener un diagnóstico preciso y un plan de tratamiento adecuado."
    };
  }
);
