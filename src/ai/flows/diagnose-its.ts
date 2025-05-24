
'use server';
/**
 * @fileOverview Un asistente de IA para pre-diagnóstico de Infecciones de Transmisión Sexual (ITS) basado en síntomas.
 *
 * - diagnoseITS - Una función que analiza síntomas y sugiere posibles ITS.
 * - DiagnoseITSInput - El tipo de entrada para la función diagnoseITS.
 * - DiagnoseITSOutput - El tipo de retorno para la función diagnoseITS.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseITSInputSchema = z.object({
  symptoms: z.string().describe('Una descripción de los síntomas que el usuario está experimentando, posiblemente relacionados con una ITS.'),
});
export type DiagnoseITSInput = z.infer<typeof DiagnoseITSInputSchema>;

const DiagnoseITSOutputSchema = z.object({
  diagnosisSummary: z
    .string()
    .describe(
      'Un análisis detallado en español enfocado en ITS. Si se identifica una ITS probable, describe sus síntomas comunes. Menciona otras ITS con síntomas similares. Proporciona un resumen general basado en los síntomas del usuario. Incluye una breve sección sobre enfoques generales de tratamiento o manejo de la ITS identificada (si aplica) y métodos de prevención relevantes (ej. uso de condón, pruebas regulares). Subraya que cualquier tratamiento debe ser discutido con un profesional médico. Incluye recomendaciones para buscar información adicional sobre salud sexual e ITS en fuentes médicas confiables. Finalmente, DEBE CONCLUIR con una advertencia clara de que esto no es un diagnóstico médico y que el usuario DEBE consultar a un médico.'
    ),
  potentialIllnessName: z
    .string()
    .describe(
      'El nombre de la ITS potencial más probable identificada (en español), que se puede usar para la generación de imágenes. Vacío si no se identifica ninguna ITS específica.'
    ),
  importantWarning: z
    .string()
    .describe('Una advertencia fija y destacada sobre la necesidad de consultar a un profesional médico.'),
  detectedTopic: z
    .enum(['ITS', 'General', 'Unknown'])
    .describe(
      "Indica si los síntomas descritos parecen estar predominantemente relacionados con una ITS ('ITS'), una condición médica general ('General'), o si no está claro ('Unknown'). Para este flujo, si los síntomas no parecen de ITS, debería indicar 'General'."
    ),
});
export type DiagnoseITSOutput = z.infer<typeof DiagnoseITSOutputSchema>;

export async function diagnoseITS(input: DiagnoseITSInput): Promise<DiagnoseITSOutput> {
  return diagnoseITSFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseITSPrompt',
  input: {schema: DiagnoseITSInputSchema},
  output: {schema: DiagnoseITSOutputSchema.pick({ diagnosisSummary: true, potentialIllnessName: true, detectedTopic: true })},
  prompt: `Eres un asistente virtual de pre-diagnóstico especializado en Infecciones de Transmisión Sexual (ITS), con un enfoque informativo y educativo. Un usuario describirá sus síntomas.
Tu objetivo es proporcionar una respuesta estructurada y útil en español, centrada en ITS. Sigue estos pasos en tu respuesta para el campo 'diagnosisSummary':

1.  **Análisis de ITS Potencial:** Si basándote en los síntomas, identificas una ITS común y reconocible como la más probable (asígnala a 'potentialIllnessName'), comienza describiendo brevemente los síntomas típicos de *esa* ITS. Si no puedes identificar una ITS específica con razonable certeza, omite este paso y deja 'potentialIllnessName' vacío.

2.  **ITS Similares:** Menciona brevemente 1-2 otras ITS que podrían presentar síntomas parecidos a los descritos por el usuario.

3.  **Resumen General del Pre-Diagnóstico (Enfoque ITS):** Proporciona un resumen general basado en el análisis de los síntomas específicos que el usuario ha ingresado, manteniendo el enfoque en posibles implicaciones de salud sexual.

4.  **Enfoques Generales de Tratamiento y Prevención de ITS:** Si se identificó una 'potentialIllnessName', describe de forma MUY GENERAL los enfoques comunes de tratamiento o manejo para esa ITS (ej: "El tratamiento suele requerir antibióticos específicos recetados por un médico", "Algunas ITS virales no tienen cura pero se pueden controlar con medicación"). Menciona también métodos de prevención cruciales como el uso correcto y consistente de preservativos, pruebas regulares de ITS, y comunicación con la(s) pareja(s). Enfatiza que cualquier plan de tratamiento específico DEBE ser determinado y supervisado por un profesional médico.

5.  **Búsqueda de Información Confiable sobre ITS:** Si has identificado una 'potentialIllnessName', sugiere al usuario buscar más información sobre esa ITS específica y sobre salud sexual en general en fuentes médicas confiables y reconocidas (por ejemplo, sitios web de organizaciones de salud gubernamentales o internacionales especializadas en salud sexual).

6.  **Advertencia Final (CRUCIAL):** El 'diagnosisSummary' DEBE CONCLUIR INVARIABLEMENTE con la siguiente frase o una muy similar y clara: "Recuerda, esta información es solo orientativa y educativa, y de ninguna manera sustituye un diagnóstico médico profesional. Es fundamental que consultes a un médico para una evaluación precisa y cualquier tratamiento necesario, especialmente si sospechas de una ITS."

Basado en los síntomas proporcionados, determina si el tema principal parece ser una Infección de Transmisión Sexual (ITS) o si los síntomas apuntan claramente a una condición médica general no relacionada. Establece el campo 'detectedTopic' a 'ITS' o 'General' según corresponda. Si los síntomas son ambiguos pero podrían ser de una ITS, prioriza 'ITS'. Si son claramente no-ITS, indica 'General'. Si es muy ambiguo, 'Unknown'.

El campo 'importantWarning' debe ser un texto fijo (se asignará después, no lo generes aquí).
Proporciona toda la información en español.

Síntomas del usuario: {{{symptoms}}}
`,
});

const diagnoseITSFlow = ai.defineFlow(
  {
    name: 'diagnoseITSFlow',
    inputSchema: DiagnoseITSInputSchema,
    outputSchema: DiagnoseITSOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
        diagnosisSummary: output?.diagnosisSummary || "No se pudo procesar la solicitud. Por favor, intente de nuevo. Recuerde consultar a un médico.",
        potentialIllnessName: output?.potentialIllnessName || "",
        detectedTopic: output?.detectedTopic || 'Unknown',
        importantWarning: "IMPORTANTE: Este análisis es generado por una IA y NO SUSTITUYE una consulta médica profesional. Los síntomas pueden ser indicativos de diversas condiciones. DEBES CONSULTAR A UN MÉDICO para obtener un diagnóstico preciso y un plan de tratamiento adecuado, especialmente si tienes preocupaciones sobre tu salud sexual."
    };
  }
);

