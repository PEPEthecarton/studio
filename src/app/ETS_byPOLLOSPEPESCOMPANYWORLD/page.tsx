
"use client";

import React, { useState, useTransition, useEffect } from "react";
import NextImage from "next/image";
import { IllnessDiagnoser } from "@/components/illness-diagnoser";
import { HeartPulse, ShieldAlert, Image as ImageIconLucide, Download, Lightbulb, Info, MapPin, Microscope, Stethoscope, AlertTriangle as AlertTriangleIcon } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateIllnessImage, type GenerateIllnessImageInput } from "@/ai/flows/generate-illness-image"; // General
import { generateSTIImage, type GenerateSTIImageInput as GenerateSTIImageInputType } from "@/ai/flows/generate-sti-image"; // STI
import type { GenerateIllnessImageOutput } from "@/ai/flows/generate-illness-image"; 

import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DiagnosisMode = 'STI' | 'General';

function StandaloneImageGenerator({ mode }: { mode: DiagnosisMode }) {
  const [illnessName, setIllnessName] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPendingImage, startTransitionImage] = useTransition();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!illnessName.trim()) {
      setError(`Por favor, ingresa el nombre de ${mode === 'STI' ? 'una ETS' : 'una enfermedad o condición'}.`);
      setGeneratedImageUrl(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);

    startTransitionImage(async () => {
      try {
        let result: GenerateIllnessImageOutput;
        if (mode === 'STI') {
          const input: GenerateSTIImageInputType = { stiName: illnessName.trim() };
          result = await generateSTIImage(input);
        } else {
          const input: GenerateIllnessImageInput = { illnessName: illnessName.trim() };
          result = await generateIllnessImage(input);
        }
        setGeneratedImageUrl(result.imageUrl);
        toast({
            title: "Imagen Generada",
            description: `Se ha generado una imagen para ${illnessName}. La imagen es una representación conceptual/educativa y no un diagnóstico.`,
        });
      } catch (e) {
        console.error(`Error generando imagen independiente (${mode}):`, e);
        setError("Ocurrió un error al generar la imagen. Por favor, inténtalo de nuevo.");
        toast({
          title: "Error al Generar Imagen",
          description: "No se pudo generar la imagen. Intenta nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    });
  };
  
  const isDataUrl = generatedImageUrl?.startsWith('data:');

  return (
    <Card className="shadow-xl rounded-lg overflow-hidden w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ImageIconLucide size={32} className="text-accent flex-shrink-0" />
          <CardTitle className="text-2xl md:text-3xl font-semibold">
            Generador de Imágenes {mode === 'STI' ? 'de ETS (Conceptuales)' : 'Médicas (Conceptuales)'}
          </CardTitle>
        </div>
        <CardDescription>
          Escribe el nombre de {mode === 'STI' ? 'una ETS' : 'una enfermedad o condición médica'} para generar una imagen ilustrativa, conceptual y educativa.
          Las imágenes generadas <strong>no son fotografías clínicas ni diagnósticos visuales.</strong> Son representaciones artísticas para fines educativos.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-3">
          <Input
            type="text"
            value={illnessName}
            onChange={(e) => setIllnessName(e.target.value)}
            placeholder={mode === 'STI' ? 'Ej: Clamidia, Herpes, VPH...' : 'Ej: Gripe, Varicela, Migraña...'}
            className="text-base"
            aria-label={`Nombre de ${mode === 'STI' ? 'la ETS' : 'la enfermedad'} para generar imagen`}
          />
          <Button onClick={handleGenerate} disabled={isLoading || isPendingImage} className="w-full sm:w-auto text-base py-2.5 px-6">
            {(isLoading || isPendingImage) ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ImageIconLucide className="mr-2 h-5 w-5" />}
            Generar Imagen {mode === 'STI' ? 'Conceptual de ETS' : 'Conceptual General'}
          </Button>
        </div>

        {(isLoading || isPendingImage) && (
          <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-md border border-border shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-lg text-muted-foreground font-medium">Generando imagen...</p>
          </div>
        )}

        {error && !isLoading && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangleIcon className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedImageUrl && !isLoading && (
          <Card className="overflow-hidden shadow-lg border-accent/30 border-l-4 mt-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Imagen conceptual para: <span className="text-accent">{illnessName}</span>
              </CardTitle>
               <CardDescription>Esta imagen es una representación conceptual y educativa, <strong>no un diagnóstico visual ni una foto clínica.</strong></CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="aspect-video relative w-full bg-muted rounded-md overflow-hidden border border-border">
                <NextImage
                  src={generatedImageUrl}
                  alt={`Imagen conceptual sobre ${illnessName}`}
                  layout="fill"
                  objectFit="contain"
                  className="transition-opacity duration-500 opacity-0"
                  onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                  data-ai-hint={mode === 'STI' ? `sti illustration abstract ${illnessName}` : `medical illustration abstract ${illnessName}`}
                  unoptimized={isDataUrl}
                />
              </div>
            </CardContent>
            <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImageUrl;
                    const safeIllnessName = illnessName?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'ilustracion_medica';
                    link.download = `imagen_conceptual_${safeIllnessName}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full sm:w-auto text-base py-2.5 px-6"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar Imagen
                </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}


export default function EtsByPollosPepesCompanyWorldPage() {
  const [currentMode, setCurrentMode] = useState<DiagnosisMode>('STI'); // Default to STI
  const { toast } = useToast();

  const handleModeSwitchSuggested = (newMode: DiagnosisMode) => {
    if (currentMode !== newMode) {
      toast({
        title: "Cambio de Enfoque Sugerido",
        description: `La IA sugiere que tus síntomas podrían corresponder mejor a un pre-diagnóstico ${newMode === 'STI' ? 'de ETS' : 'General'}. Hemos actualizado la pestaña por ti.`,
        variant: "default",
        duration: 8000, 
      });
      setCurrentMode(newMode); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-3 md:gap-4">
          <HeartPulse size={40} className="text-primary-foreground flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight truncate">
            Asistente de Pre-Diagnóstico AI
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-10 md:space-y-16 flex-grow">
        <Alert variant="destructive" className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md shadow">
            <AlertTriangleIcon className="h-6 w-6 mr-2 flex-shrink-0" />
            <div>
              <AlertTitle className="font-bold text-lg mb-1">¡Atención Importante!</AlertTitle>
              <AlertDescription className="text-sm">
                Esta herramienta es solo para fines informativos y educativos. <strong>NO sustituye el consejo, diagnóstico o tratamiento médico profesional.</strong> Si tienes alguna preocupación sobre tu salud, <strong>DEBES CONSULTAR A UN MÉDICO INMEDIATAMENTE.</strong> No demores la búsqueda de consejo médico ni ignores el consejo médico profesional debido a algo que hayas leído aquí.
              </AlertDescription>
            </div>
        </Alert>

        <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as DiagnosisMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-2/3 lg:w-1/2 mx-auto shadow-md">
            <TabsTrigger value="STI" className="py-2.5 text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Microscope className="mr-2 h-5 w-5" /> Pre-Diagnóstico ETS
            </TabsTrigger>
            <TabsTrigger value="General" className="py-2.5 text-sm sm:text-base data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Stethoscope className="mr-2 h-5 w-5" /> Pre-Diagnóstico General
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="STI" className="mt-6">
            <section id="diagnosis-tool-sti" aria-labelledby="diagnosis-tool-sti-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert size={32} className="text-accent flex-shrink-0" />
                <h2 id="diagnosis-tool-sti-heading" className="text-2xl md:text-3xl font-semibold text-foreground">
                  Analiza tus Síntomas (Enfoque ETS)
                </h2>
              </div>
              <IllnessDiagnoser mode="STI" onModeSwitchSuggested={handleModeSwitchSuggested} />
            </section>
          </TabsContent>

          <TabsContent value="General" className="mt-6">
            <section id="diagnosis-tool-general" aria-labelledby="diagnosis-tool-general-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <ShieldAlert size={32} className="text-accent flex-shrink-0" />
                <h2 id="diagnosis-tool-general-heading" className="text-2xl md:text-3xl font-semibold text-foreground">
                  Analiza tus Síntomas (Enfoque General)
                </h2>
              </div>
              <IllnessDiagnoser mode="General" onModeSwitchSuggested={handleModeSwitchSuggested} />
            </section>
          </TabsContent>
        </Tabs>
        
        <section id="standalone-image-generator" aria-labelledby="standalone-image-generator-heading" className="scroll-mt-20 pt-8 border-t border-border/50">
           <StandaloneImageGenerator mode={currentMode} />
        </section>
        
        <section id="local-info-colima" aria-labelledby="local-info-colima-heading" className="scroll-mt-20 pt-8 border-t border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <MapPin size={32} className="text-accent flex-shrink-0" />
            <h2 id="local-info-colima-heading" className="text-2xl md:text-3xl font-semibold text-foreground">
              Información para usuarios en Colima, México
            </h2>
          </div>
          <Alert variant="default" className="bg-secondary/50 border-l-4 border-accent p-4 rounded-md shadow">
            <Info className="h-6 w-6 mr-2 flex-shrink-0 text-accent" />
             <div>
              <AlertTitle className="font-bold text-lg mb-1 text-accent">Orientación Médica Local en Colima</AlertTitle>
              <AlertDescription className="text-sm text-secondary-foreground">
                Si te encuentras en Colima, Colima, México y necesitas asistencia médica o información sobre salud (incluyendo salud sexual y ETS):
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Consulta los servicios ofrecidos por la <strong>Secretaría de Salud del Estado de Colima</strong>. Ellos pueden orientarte sobre clínicas públicas, hospitales y centros de salud.</li>
                  <li>Busca <strong>directorios oficiales de servicios de salud gubernamentales</strong> en Colima. Estos suelen estar disponibles en línea o a través de oficinas gubernamentales.</li>
                  <li>Infórmate sobre programas de salud sexual y reproductiva que puedan existir en tu municipio o estado.</li>
                  <li>En caso de emergencia médica, acude al servicio de urgencias del hospital más cercano o llama a los números de emergencia locales.</li>
                </ul>
                <p className="mt-3">
                  Es importante buscar atención médica profesional para un diagnóstico preciso y tratamiento adecuado. No dudes en contactar a las autoridades de salud locales para obtener información actualizada y confiable sobre dónde recibir atención.
                </p>
              </AlertDescription>
            </div>
          </Alert>
        </section>

      </main>

      <footer className="py-8 mt-12 text-center text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} Asistente de Pre-Diagnóstico Médico AI por POLLO'S PEPES COMPANY WORLD. Contenido educativo. Consulta siempre a un profesional.</p>
      </footer>
      <Toaster />
    </div>
  );
}

/* AlertTriangleIcon is already defined in the original file.
   If it were missing, it would be:
function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
*/
