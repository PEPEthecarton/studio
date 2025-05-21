"use client";

import React, { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { summarizeSTIInformation, type SummarizeSTIInformationInput } from "@/ai/flows/summarize-sti-information";
import { Loader2, AlertTriangle, Search, Info } from "lucide-react"; // Changed AlertCircle to AlertTriangle for errors

export function StiSearch() {
  const [query, setQuery] = useState("");
  const [searchQueryDisplay, setSearchQueryDisplay] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim()) {
      setError("Por favor, ingresa un término de búsqueda.");
      setSummary(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);
    setSearchQueryDisplay(query);

    startTransition(async () => {
      try {
        const input: SummarizeSTIInformationInput = { query: query.trim() };
        const result = await summarizeSTIInformation(input);
        setSummary(result.summary);
      } catch (e) {
        console.error("Error fetching STI information:", e);
        setError("Ocurrió un error al buscar la información. Por favor, verifica tu consulta o inténtalo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <Card className="shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-card">
        <CardTitle className="text-xl font-semibold">Busca Información Detallada</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ingresa el nombre de una ETS (por ejemplo, Clamidia, VIH) para obtener un resumen sobre síntomas, tratamientos y prevención.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-background">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: Clamidia, Gonorrea, VIH..."
            className="flex-grow text-base"
            aria-label="Nombre de la ETS a buscar"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} disabled={isLoading || isPending} className="w-full sm:w-auto text-base py-2.5 px-6">
            {(isLoading || isPending) ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Search className="mr-2 h-5 w-5" />
            )}
            Buscar
          </Button>
        </div>

        {(isLoading || isPending) && (
          <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 rounded-md border border-border shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-lg text-muted-foreground font-medium">Buscando información...</p>
            <p className="text-sm text-muted-foreground">Esto puede tardar unos segundos.</p>
          </div>
        )}

        {error && !isLoading && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error Inesperado</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && !isLoading && !error && (
          <Card className="bg-card shadow-lg border-primary/30 border-l-4">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-primary flex-shrink-0" />
                <CardTitle className="text-xl font-semibold">Resumen sobre: <span className="text-primary">{searchQueryDisplay}</span></CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">{summary}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
