
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, QrCode } from 'lucide-react';
// import NextImage from 'next/image'; // Not used for external QR service
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string>('');

  useEffect(() => {
    // Ensure this runs only on the client where window is defined
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      const toolPageUrl = `${currentOrigin}/ETS_byPOLLOSPEPESCOMPANYWORLD`;
      setPageUrl(toolPageUrl);
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(toolPageUrl)}`);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary to-background p-6 text-center">
      <div className="bg-card p-8 sm:p-12 rounded-xl shadow-2xl max-w-2xl w-full">
        <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 text-foreground">
          Bienvenido a la Herramienta de Pre-Diagnóstico
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
          Explora información sobre posibles condiciones de salud basadas en tus síntomas.
          Desarrollado por POLLO'S PEPES COMPANY WORLD.
        </p>

        {qrCodeUrl && pageUrl && (
          <div className="mb-10 p-6 bg-secondary/50 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold mb-3 text-foreground flex items-center justify-center">
              <QrCode className="mr-2 h-6 w-6 text-primary" />
              ¡Comparte Fácilmente!
            </h2>
            <p className="text-muted-foreground mb-4 text-sm">
              Escanea este código QR con tu móvil para acceder directamente a la herramienta:
            </p>
            <div className="flex justify-center mb-2">
              {/* Using a standard img tag for external QR service to avoid next/image config */}
              <img 
                src={qrCodeUrl} 
                alt="Código QR para la herramienta ETS_byPOLLOSPEPESCOMPANYWORLD" 
                width={200} 
                height={200} 
                className="rounded-md border-4 border-primary shadow-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground break-all">
              O comparte este enlace: <a href={pageUrl} className="text-primary hover:underline">{pageUrl}</a>
            </p>
          </div>
        )}

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
