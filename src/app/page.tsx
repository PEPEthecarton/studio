
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary to-background p-6 text-center">
      <div className="bg-card p-8 sm:p-12 rounded-xl shadow-2xl max-w-2xl w-full">
        <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-foreground">
          Bienvenido a la Herramienta de Pre-Diagnóstico
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10">
          Explora información sobre posibles condiciones de salud basadas en tus síntomas.
          Desarrollado por POLLO'S PEPES COMPANY WORLD.
        </p>
        <Link href="/ETS_byPOLLOSPEPESCOMPANYWORLD" passHref legacyBehavior>
          <Button size="lg" className="text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <Zap className="mr-2 h-5 w-5" />
            Ir a la Herramienta de Pre-Diagnóstico
          </Button>
        </Link>
        <p className="mt-8 text-xs text-muted-foreground">
          Recuerda: Esta herramienta es educativa y no reemplaza una consulta médica.
        </p>
      </div>
       <footer className="py-8 mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} POLLO'S PEPES COMPANY WORLD. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
