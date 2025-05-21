
"use client";

import React, { useState, useTransition, useEffect } from "react";
import NextImage from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Search, Image as ImageIconLucide, Download, Sparkles, MessageSquareWarning, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Importar los flows y tipos específicos
import { diagnoseIllness, type DiagnoseIllnessInput, type DiagnoseIllnessOutput as DiagnoseGeneralOutput } from "@/ai/flows/diagnose-illness";
import { diagnoseSTI, type DiagnoseSTIInput, type DiagnoseSTIOutput } from "@/ai/flows/diagnose-sti";
import { generateIllnessImage, type GenerateIllnessImageInput as GenerateGeneralImageInput } from "@/ai/flows/generate-illness-image";
import { generateSTIImage, type GenerateSTIImageInput } from "@/ai/flows/generate-sti-image";
import type { GenerateIllnessImageOutput } from "@/ai/flows/generate-illness-image"; // Output es similar

type DiagnosisMode = 'STI' | 'General';
type CombinedDiagnosisOutput = (DiagnoseGeneralOutput | DiagnoseSTIOutput) & { detectedTopic?: 'STI' | 'General' | 'Unknown' };


interface IllnessDiagnoserProps {
  mode: DiagnosisMode;
  onModeSwitchSuggested: (newMode: DiagnosisMode) => void;
}

export function IllnessDiagnoser({ mode, onModeSwitchSuggested }: IllnessDiagnoserProps) {
  const [symptoms, setSymptoms] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState<CombinedDiagnosisOutput | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPendingDiagnosis, startTransitionDiagnosis] = useTransition();
  const [isPendingImage, startTransitionImage] = useTransition();
  const { toast } = useToast();

  // Reset state when mode changes
  useEffect(() => {
    setSymptoms("");
    setDiagnosisResult(null);
    setGeneratedImageUrl(null);
    setError(null);
  }, [mode]);

  const handleDiagnose = () => {
    if (!symptoms.trim()) {
      setError("Por favor, describe tus síntomas.");
      setDiagnosisResult(null);
      setGeneratedImageUrl(null);
      return;
    }

    setIsLoadingDiagnosis(true);
    setError(null);
    setDiagnosisResult(null);
    setGeneratedImageUrl(null);

    startTransitionDiagnosis(async () => {
      try {
        let result: CombinedDiagnosisOutput;
        if (mode === 'STI') {
          const input: DiagnoseSTIInput = { symptoms: symptoms.trim() };
          result = await diagnoseSTI(input);
        } else {
          const input: DiagnoseIllnessInput = { symptoms: symptoms.trim() };
          result = await diagnoseIllness(input);
        }
        setDiagnosisResult(result);

        if (result.detectedTopic && result.detectedTopic !== 'Unknown' && result.detectedTopic !== mode) {
          onModeSwitchSuggested(result.detectedTopic);
        }

      } catch (e) {
        console.error(`Error en el pre-diagnóstico (${mode}):`, e);
        setError("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.");
        toast({
          title: "Error de Pre-Diagnóstico",
          description: "No se pudo obtener el pre-diagnóstico. Intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDiagnosis(false);
      }
    });
  };

  const handleGenerateImageFromDiagnosis = () => {
    if (!diagnosisResult?.potentialIllnessName) {
      setError("No hay un nombre de enfermedad potencial para generar la imagen.");
      return;
    }

    setIsLoadingImage(true);
    setError(null); 
    setGeneratedImageUrl(null);

    startTransitionImage(async () => {
      try {
        let imageResult: GenerateIllnessImageOutput;
        const illnessName = diagnosisResult.potentialIllnessName!;
        if (mode === 'STI') {
            const input: GenerateSTIImageInput = { stiName: illnessName };
            imageResult = await generateSTIImage(input);
        } else {
            const input: GenerateGeneralImageInput = { illnessName: illnessName };
            imageResult = await generateIllnessImage(input);
        }
        setGeneratedImageUrl(imageResult.imageUrl);
        toast({
            title: "Imagen Conceptual Generada",
            description: `Se ha generado una imagen conceptual para ${illnessName}. Esta es una representación artística, no una foto clínica.`,
        });
      } catch (e) {
        console.error(`Error generando imagen desde diagnóstico (${mode}):`, e);
        setError("Ocurrió un error al generar la imagen conceptual. Por favor, inténtalo de nuevo.");
        toast({
          title: "Error al Generar Imagen Conceptual",
          description: "No se pudo generar la imagen. Intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingImage(false);
      }
    });
  };
  
  const isDataUrl = generatedImageUrl?.startsWith('data:');

  return (
    <Card className="shadow-xl rounded-lg overflow-hidden w-full">
      <CardHeader className="bg-card">
        <CardTitle className="text-xl font-semibold">
          Describe tus Síntomas {mode === 'STI' ? '(Enfoque ETS)' : '(Enfoque General)'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Ingresa una descripción detallada de cómo te sientes. La IA ofrecerá información general y educativa según el enfoque seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-background">
        <div className="space-y-3">
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={
              mode === 'STI' 
              ? "Ej: He notado irritación y flujo inusual en mis genitales..." 
              : "Ej: Tengo fiebre alta, dolor de cabeza y fatiga desde hace tres días..."
            }
            className="text-base min-h-[120px]"
            aria-label="Descripción de síntomas"
            rows={5}
          />
          <Button 
            onClick={handleDiagnose} 
            disabled={isLoadingDiagnosis || isPendingDiagnosis} 
            className="w-full sm:w-auto text-base py-2.5 px-6"
          >
            {(isLoadingDiagnosis || isPendingDiagnosis) ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Obtener Pre-Diagnóstico AI {mode === 'STI' ? '(ETS)' : '(General)'}
          </Button>
        </div>

        {(isLoadingDiagnosis || isPendingDiagnosis) && (
          <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-md border border-border shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-lg text-muted-foreground font-medium">Analizando síntomas...</p>
            <p className="text-sm text-muted-foreground">Esto puede tomar unos segundos.</p>
          </div>
        )}

        {error && !isLoadingDiagnosis && !isLoadingImage && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {diagnosisResult && !isLoadingDiagnosis && (
          <Card className="bg-card shadow-lg border-primary/30 border-l-4 mt-6">
            <CardHeader>
               <div className="flex items-center gap-3">
                <MessageSquareWarning className="h-7 w-7 text-destructive flex-shrink-0" />
                <CardTitle className="text-xl font-semibold text-destructive">Análisis Informativo (No es un Diagnóstico Médico)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="border-destructive text-destructive-foreground bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <AlertTitle className="font-bold">¡MUY IMPORTANTE!</AlertTitle>
                <AlertDescription className="text-destructive-foreground">
                  {diagnosisResult.importantWarning}
                </AlertDescription>
              </Alert>
              
              <div>
                <h4 className="font-semibold text-lg mb-2 text-foreground">Resumen Basado en tus Síntomas ({mode === 'STI' ? 'Enfoque ETS' : 'Enfoque General'}):</h4>
                <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                  {diagnosisResult.diagnosisSummary}
                </p>
              </div>
              
              {diagnosisResult.potentialIllnessName && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    La IA ha identificado "<strong className="text-accent">{diagnosisResult.potentialIllnessName}</strong>" como una posible condición relacionada.
                    ¿Deseas generar una imagen conceptual ilustrativa?
                  </p>
                  <Button 
                    onClick={handleGenerateImageFromDiagnosis} 
                    disabled={isLoadingImage || isPendingImage}
                    variant="outline"
                    className="w-full sm:w-auto text-base py-2.5 px-6"
                  >
                    {(isLoadingImage || isPendingImage) ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ImageIconLucide className="mr-2 h-5 w-5" />
                    )}
                    Generar Imagen de "{diagnosisResult.potentialIllnessName}"
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    La imagen generada es solo para fines ilustrativos y educativos. <strong>No confirma ningún diagnóstico ni es una foto clínica.</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {generatedImageUrl && !isLoadingImage && diagnosisResult?.potentialIllnessName && (
          <Card className="overflow-hidden shadow-lg border-accent/30 border-l-4 mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                1. Imagen Conceptual (Generada por IA) para: <span className="text-accent">{diagnosisResult?.potentialIllnessName}</span>
              </CardTitle>
              <CardDescription>Esta imagen es una representación artística y educativa, <strong>no un diagnóstico visual ni una foto clínica.</strong></CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="aspect-video relative w-full bg-muted rounded-md overflow-hidden border border-border">
                <NextImage
                  src={generatedImageUrl}
                  alt={`Imagen conceptual sobre ${diagnosisResult?.potentialIllnessName}`}
                  layout="fill"
                  objectFit="contain"
                  className="transition-opacity duration-500 opacity-0"
                  onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                  data-ai-hint={mode === 'STI' ? `sti concept art ${diagnosisResult?.potentialIllnessName}` : `illness concept art ${diagnosisResult?.potentialIllnessName}`}
                  unoptimized={isDataUrl} 
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImageUrl;
                    const safeIllnessName = diagnosisResult?.potentialIllnessName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ilustracion_medica_conceptual';
                    link.download = `imagen_conceptual_ia_${safeIllnessName}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full sm:w-auto text-base py-2.5 px-6"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar Imagen (IA)
                </Button>
            </CardFooter>
          </Card>
        )}

        {/* Sección para buscar imágenes en la web */}
        {(generatedImageUrl || (diagnosisResult && diagnosisResult.potentialIllnessName)) && !isLoadingImage && (
          <Card className="mt-6 shadow-lg border-primary/30 border-l-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                 <Search className="h-7 w-7 text-primary flex-shrink-0" />
                <CardTitle className="text-lg font-semibold">
                  2. Para Referencias Visuales Adicionales (Fuentes Externas)
                </CardTitle>
              </div>
              <CardDescription>
                Si deseas ver ejemplos visuales de cómo podría manifestarse "<strong className="text-accent">{diagnosisResult?.potentialIllnessName || "esta condición"}</strong>", puedes buscar imágenes en sitios web médicos reconocidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>Considera buscar en (copia y pega el nombre en tu buscador):</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>MedlinePlus (de la Biblioteca Nacional de Medicina de EE. UU.)</li>
                <li>Sitios web de la Organización Mundial de la Salud (OMS)</li>
                <li>Portales de Secretarías de Salud o Ministerios de Sanidad de tu país</li>
                <li>Sitios educativos de clínicas y hospitales universitarios de prestigio</li>
              </ul>
              <Alert variant="default" className="bg-secondary/50 border-secondary mt-2">
                <Info className="h-5 w-5" />
                <AlertTitle className="font-semibold">Importante al Buscar Imágenes Médicas</AlertTitle>
                <AlertDescription>
                  Ten en cuenta que las imágenes médicas pueden ser explícitas o gráficas. Realiza estas búsquedas bajo tu propia discreción y con fines informativos. Esta herramienta no está afiliada a los sitios externos ni controla su contenido.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {isLoadingImage && !diagnosisResult?.potentialIllnessName && (
          <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-md border border-border shadow-sm mt-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-lg text-muted-foreground font-medium">Generando imagen conceptual...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

