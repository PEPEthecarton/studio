
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, QrCode } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [pageUrl, setPageUrl] = useState<string>('');

  useEffect(() => {
    // Ensure this runs only on the client where window is defined
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      const toolPageUrl = `${currentOrigin}/ITS_byPOLLOSPEPESCOMPANYWORLD`;
      setPageUrl(toolPageUrl);
      
      // Add a cache-busting parameter to the QR code URL
      const timestamp = Date.now();
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(toolPageUrl)}&cachebust=${timestamp}`);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4 sm:p-6 text-center">
      <div className="bg-card p-6 sm:p-8 md:p-12 rounded-xl shadow-2xl max-w-2xl w-full">
        <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4 sm:mb-6" />
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-6 text-foreground">
          Bienvenido a la Herramienta de Pre-Diagnóstico
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8">
          Explora información sobre posibles condiciones de salud basadas en tus síntomas.
          Desarrollado por POLLO'S PEPES COMPANY WORLD.
        </p>

        {qrCodeUrl && pageUrl && (
          <div className="mb-8 sm:mb-10 p-4 sm:p-6 bg-secondary/50 rounded-lg shadow-inner">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-foreground flex items-center justify-center">
              <QrCode className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              ¡Comparte Fácilmente!
            </h2>
            <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
              Escanea este código QR con tu móvil para acceder directamente a la herramienta:
            </p>
            <div className="flex justify-center mb-2">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="Código QR para la herramienta ITS_byPOLLOSPEPESCOMPANYWORLD" 
                  width={160} 
                  height={160} 
                  className="rounded-md border-4 border-primary shadow-lg w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px]"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground break-words">
              O comparte este enlace: <Link href="/ITS_byPOLLOSPEPESCOMPANYWORLD" className="text-primary hover:underline font-semibold">ITS_POLLOSPEPESWORLDCOMPAMPANY</Link>
            </p>
          </div>
        )}

        <Link href="/ITS_byPOLLOSPEPESCOMPANYWORLD" passHref legacyBehavior>
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 px-6 sm:px-8 py-3 sm:py-2.5"
          >
            <Zap className="mr-2 h-5 w-5" />
            Ir a la Herramienta de Pre-Diagnóstico
          </Button>
        </Link>
        <p className="mt-6 sm:mt-8 text-xs text-muted-foreground">
          Recuerda: Esta herramienta es educativa y no reemplaza una consulta médica.
        </p>
      </div>
       <footer className="py-6 sm:py-8 mt-10 sm:mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} POLLO'S PEPES COMPANY WORLD. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
