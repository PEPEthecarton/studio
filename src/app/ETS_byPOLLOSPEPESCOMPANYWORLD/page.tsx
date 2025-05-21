
"use client";

import React from "react";
import { IllnessDiagnoser } from "@/components/illness-diagnoser";
import { HeartPulse, ShieldAlert } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function EtsByPollosPepesCompanyWorldPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-3 md:gap-4">
          <HeartPulse size={40} className="text-primary-foreground flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight truncate">
            Asistente de Pre-Diagnóstico Médico AI
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-10 md:space-y-16 flex-grow">
        <section id="diagnosis-tool" aria-labelledby="diagnosis-tool-heading" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert size={32} className="text-accent flex-shrink-0" />
            <h2 id="diagnosis-tool-heading" className="text-2xl md:text-3xl font-semibold text-foreground">
              Analiza tus Síntomas (Pre-Diagnóstico)
            </h2>
          </div>
          <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md mb-6 shadow">
            <h3 className="font-bold text-lg mb-2 flex items-center">
              <AlertTriangleIcon className="h-6 w-6 mr-2" /> ¡Atención Importante!
            </h3>
            <p className="text-sm">
              Esta herramienta es solo para fines informativos y educativos. <strong>NO sustituye el consejo, diagnóstico o tratamiento médico profesional.</strong> Si tienes alguna preocupación sobre tu salud, <strong>DEBES CONSULTAR A UN MÉDICO INMEDIATAMENTE.</strong> No demores la búsqueda de consejo médico ni ignores el consejo médico profesional debido a algo que hayas leído aquí.
            </p>
          </div>
          <IllnessDiagnoser />
        </section>
      </main>

      <footer className="py-8 mt-12 text-center text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} Asistente de Pre-Diagnóstico Médico AI. Contenido educativo. Consulta siempre a un profesional.</p>
      </footer>
      <Toaster />
    </div>
  );
}

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
