'use client';

import Image from 'next/image';

interface BookCoverProps {
  title: string;
  coverUrl?: string | null;
  className?: string;
}

export function BookCover({ title, coverUrl, className = 'h-64' }: BookCoverProps) {
  if (coverUrl) {
    return (
      <div
        className={`${className} relative bg-gradient-to-br from-primary to-primary/70 overflow-hidden`}
      >
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          quality={85}
          priority={false}
        />
      </div>
    );
  }

  // Obter primeira letra do título
  const firstLetter = title.charAt(0).toUpperCase();

  // Placeholder elegante com gradient + letra
  return (
    <div
      className={`${className} relative bg-gradient-to-br from-secondary/40 via-primary to-accent/20 overflow-hidden flex flex-col items-center justify-center p-4`}
    >
      {/* Background pattern - linhas suaves simulando livro */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/2 w-1 h-full bg-white transform -translate-x-1/2" />
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="books" patternUnits="userSpaceOnUse" width="40" height="40">
              <line x1="0" y1="0" x2="40" y2="40" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#books)" />
        </svg>
      </div>

      {/* Decoração de fundo - círculos suaves */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-secondary rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-accent rounded-full blur-2xl" />
      </div>

      {/* Conteúdo - Letra inicial grande */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4">
        {/* Círculo com primeira letra */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg border-2 border-secondary/30">
          <span className="text-4xl font-bold text-white/80">{firstLetter}</span>
        </div>

        {/* Ícone de livro simplificado */}
        <svg className="w-12 h-12 text-secondary/40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4.5A2.5 2.5 0 016.5 2h7A2.5 2.5 0 0116 4.5v15a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 014 19.5v-15z" />
          <path d="M14 6.5v11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>

        {/* Título truncado e legível */}
        <p className="text-xs font-medium text-secondary/70 text-center leading-tight max-w-[85%] line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );
}
