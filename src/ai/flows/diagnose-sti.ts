
'use server';
/**
 * @fileOverview Un asistente de IA para pre-diagnóstico de Enfermedades de Transmisión Sexual (ETS) basado en síntomas.
 *
 * - diagnoseSTI - Una función que analiza síntomas y sugiere posibles ETS.
 * - DiagnoseSTIInput - El tipo de entrada para la función diagnoseSTI.
 * - DiagnoseSTIOutput - El tipo de retorno para la función diagnoseSTI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseSTIInputSchema = z.object({
  symptoms: z.string().describe('Una descripción de los síntomas que el usuario está experimentando, posiblemente relacionados con una ETS.'),
});
export type DiagnoseSTIInput = z.infer<typeof DiagnoseSTIInputSchema>;

const DiagnoseSTIOutputSchema = z.object({
  diagnosisSummary: z
    .string()
    .describe(
      'Un análisis detallado en español enfocado en ETS. Si se identifica una ETS probable, describe sus síntomas comunes. Menciona otras ETS con síntomas similares. Proporciona un resumen general basado en los síntomas del usuario. Incluye recomendaciones para buscar información adicional sobre salud sexual y ETS en fuentes médicas confiables. Finalmente, DEBE CONCLUIR con una advertencia clara de que esto no es un diagnóstico médico y que el usuario DEBE consultar a un médico.'
    ),
  potentialIllnessName: z
    .string()
    .describe(
      'El nombre de la ETS potencial más probable identificada (en español), que se puede usar para la generación de imágenes. Vacío si no se identifica ninguna ETS específica.'
    ),
  importantWarning: z
    .string()
    .describe('Una advertencia fija y destacada sobre la necesidad de consultar a un profesional médico.'),
  detectedTopic: z
    .enum(['STI', 'General', 'Unknown'])
    .describe(
      "Indica si los síntomas descritos parecen estar predominantemente relacionados con una ETS ('STI'), una condición médica general ('General'), o si no está claro ('Unknown'). Para este flujo, si los síntomas no parecen de ETS, debería indicar 'General'."
    ),
});
export type DiagnoseSTIOutput = z.infer<typeof DiagnoseSTIOutputSchema>;

export async function diagnoseSTI(input: DiagnoseSTIInput): Promise<DiagnoseSTIOutput> {
  return diagnoseSTIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseSTIPrompt',
  input: {schema: DiagnoseSTIInputSchema},
  output: {schema: DiagnoseSTIOutputSchema.pick({ diagnosisSummary: true, potentialIllnessName: true, detectedTopic: true })},
  prompt: `Eres un asistente virtual de pre-diagnóstico especializado en Enfermedades de Transmisión Sexual (ETS), con un enfoque informativo y educativo. Un usuario describirá sus síntomas.
Tu objetivo es proporcionar una respuesta estructurada y útil en español, centrada en ETS. Sigue estos pasos en tu respuesta para el campo 'diagnosisSummary':

1.  **Análisis de ETS Potencial:** Si basándote en los síntomas, identificas una ETS común y reconocible como la más probable (asígnala a 'potentialIllnessName'), comienza describiendo brevemente los síntomas típicos de *esa* ETS. Si no puedes identificar una ETS específica con razonable certeza, omite este paso y deja 'potentialIllnessName' vacío.

2.  **ETS Similares:** Menciona brevemente 1-2 otras ETS que podrían presentar síntomas parecidos a los descritos por el usuario.

3.  **Resumen General del Pre-Diagnóstico (Enfoque ETS):** Proporciona un resumen general basado en el análisis de los síntomas específicos que el usuario ha ingresado, manteniendo el enfoque en posibles implicaciones de salud sexual.

4.  **Búsqueda de Información Confiable sobre ETS:** Si has identificado una 'potentialIllnessName', sugiere al usuario buscar más información sobre esa ETS específica y sobre salud sexual en general en fuentes médicas confiables y reconocidas (por ejemplo, sitios web de organizaciones de salud gubernamentales o internacionales especializadas en salud sexual).

5.  **Advertencia Final (CRUCIAL):** El 'diagnosisSummary' DEBE CONCLUIR INVARIABLEMENTE con la siguiente frase o una muy similar y clara: "Recuerda, esta información es solo orientativa y educativa, y de ninguna manera sustituye un diagnóstico médico profesional. Es fundamental que consultes a un médico para una evaluación precisa y cualquier tratamiento necesario, especialmente si sospechas de una ETS."

Basado en los síntomas proporcionados, determina si el tema principal parece ser una Enfermedad de Transmisión Sexual (ETS) o si los síntomas apuntan claramente a una condición médica general no relacionada. Establece el campo 'detectedTopic' a 'STI' o 'General' según corresponda. Si los síntomas son ambiguos pero podrían ser de una ETS, prioriza 'STI'. Si son claramente no-ETS, indica 'General'. Si es muy ambiguo, 'Unknown'.

El campo 'importantWarning' debe ser un texto fijo (se asignará después, no lo generes aquí).
Proporciona toda la información en español.

Síntomas del usuario: {{{symptoms}}}
`,
});

const diagnoseSTIFlow = ai.defineFlow(
  {
    name: 'diagnoseSTIFlow',
    inputSchema: DiagnoseSTIInputSchema,
    outputSchema: DiagnoseSTIOutputSchema,
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
