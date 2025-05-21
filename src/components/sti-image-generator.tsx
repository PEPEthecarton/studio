"use client";

import React, { useState, useTransition } from "react";
import NextImage from "next/image"; // Aliased to NextImage to avoid conflict with lucide-react Image
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateSTIImage, type GenerateSTIImageInput } from "@/ai/flows/generate-sti-image";
import { Loader2, AlertTriangle, Image as ImageIconLucide, Download } from "lucide-react";

export function StiImageGenerator() {
  const [stiName, setStiName] = useState("");
  const [imageQueryDisplay, setImageQueryDisplay] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerateImage = () => {
    if (!stiName.trim()) {
      setError("Por favor, ingresa el nombre de una ETS para generar la imagen.");
      setImageUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setImageQueryDisplay(stiName);

    startTransition(async () => {
      try {
        const input: GenerateSTIImageInput = { stiName: stiName.trim() };
        const result = await generateSTIImage(input);
        setImageUrl(result.imageUrl);
      } catch (e) {
        console.error("Error generating STI image:", e);
        setError("Ocurrió un error al generar la imagen. Por favor, verifica tu consulta o inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  const isDataUrl = imageUrl?.startsWith('data:');

  return (
    <Card className="shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-card">
        <CardTitle className="text-xl font-semibold">Generador de Imágenes</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ingresa el nombre de una ETS para generar una imagen educativa relacionada.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-background">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            value={stiName}
            onChange={(e) => setStiName(e.target.value)}
            placeholder="Ej: Sífilis, Herpes genital..."
            className="flex-grow text-base"
            aria-label="Nombre de la ETS para generar imagen"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleGenerateImage();
              }
            }}
          />
          <Button onClick={handleGenerateImage} disabled={isLoading || isPending} className="w-full sm:w-auto text-base py-2.5 px-6">
            {(isLoading || isPending) ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ImageIconLucide className="mr-2 h-5 w-5" />
            )}
            Generar Imagen
          </Button>
        </div>

        {(isLoading || isPending) && (
          <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-md border border-border shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-lg text-muted-foreground font-medium">Generando imagen...</p>
            <p className="text-sm text-muted-foreground">Esto puede tomar unos segundos.</p>
          </div>
        )}

        {error && !isLoading && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error Inesperado</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {imageUrl && !isLoading && !error && (
          <div className="mt-6 space-y-4">
            <Card className="overflow-hidden shadow-lg border-accent/30 border-l-4">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Imagen generada para: <span className="text-accent">{imageQueryDisplay}</span></CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="aspect-video relative w-full bg-muted rounded-md overflow-hidden border border-border">
                <NextImage
                  src={imageUrl}
                  alt={`Imagen educativa sobre ${imageQueryDisplay}`}
                  layout="fill"
                  objectFit="contain"
                  className="transition-opacity duration-500 opacity-0"
                  onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                  data-ai-hint="medical illustration disease" // AI hint for potential image search
                  unoptimized={isDataUrl} 
                />
                </div>
              </CardContent>
            </Card>
            <Button
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageUrl;
                // Sanitize filename
                const safeStiName = imageQueryDisplay.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                link.download = `imagen_ets_${safeStiName || 'generada'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-full sm:w-auto text-base py-2.5 px-6 hover:bg-accent/10"
              aria-label={`Descargar imagen de ${imageQueryDisplay}`}
            >
              <Download className="mr-2 h-5 w-5" />
              Descargar Imagen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
