"use client";

import React from "react";
import { StiSearch } from "@/components/sti-search";
import { StiImageGenerator } from "@/components/sti-image-generator";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Image as ImageIconLucide, ShieldQuestion } from "lucide-react"; // Renamed Image to avoid conflict
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="py-6 px-4 md:px-8 bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex items-center gap-3 md:gap-4">
          <ShieldQuestion size={40} className="text-primary-foreground flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight truncate">
            ETS BY PEPE'WORDCOMPANY
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-10 md:space-y-16 flex-grow">
        <section id="sti-info" aria-labelledby="sti-info-heading" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={32} className="text-accent flex-shrink-0" />
            <h2 id="sti-info-heading" className="text-2xl md:text-3xl font-semibold text-foreground">
              Información sobre ETS
            </h2>
          </div>
          <StiSearch />
        </section>

        <Separator className="my-8 md:my-12 bg-border/70" />

        <section id="sti-image" aria-labelledby="sti-image-heading" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <ImageIconLucide size={32} className="text-accent flex-shrink-0" />
            <h2 id="sti-image-heading" className="text-2xl md:text-3xl font-semibold text-foreground">
              Generador de Imágenes Educativas
            </h2>
          </div>
          <StiImageGenerator />
        </section>
      </main>

      <footer className="py-8 mt-12 text-center text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} ETS BY PEPE'WORDCOMPANY. Todos los derechos reservados.</p>
      </footer>
      <Toaster />
    </div>
  );
}
