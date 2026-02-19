'use client';

import Image from 'next/image';

interface BookCoverProps {
  title: string;
  coverUrl?: string | null;
  className?: string;
}

export function BookCover({ title, coverUrl, className = 'h-64' }: BookCoverProps) {
  // Função para abreviar título para o placeholder
  const getAbbreviatedTitle = (title: string) => {
    return title.substring(0, 40);
  };

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
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={false}
        />
      </div>
    );
  }

  // Placeholder elegante com gradient
  return (
    <div
      className={`${className} relative bg-gradient-to-br from-primary via-primary/80 to-secondary/20 overflow-hidden flex flex-col items-center justify-center p-4`}
    >
      {/* Decoração de fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-full blur-3xl" />
      </div>

      {/* Conteúdo do placeholder */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center h-full gap-3">
        {/* Ícone de livro */}
        <svg
          className="w-16 h-16 text-secondary/60 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25m20-11.002c0 .244 0 .505 0 .778m0 0c0 6.252-4.5 10.997-9.999 10.997C5.5 28.028 1 23.283 1 17.03m20 0V9.222c0-.245 0-.505 0-.778M18 9.5a9 9 0 10-18 0"
          />
        </svg>

        {/* Título truncado */}
        <p className="text-sm font-semibold text-text-muted text-center leading-tight max-w-[90%]">
          {getAbbreviatedTitle(title)}
        </p>

        {/* Texto de fallback */}
        <p className="text-xs text-text-muted/60">Sem imagem</p>
      </div>
    </div>
  );
}
