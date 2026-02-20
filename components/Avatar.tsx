'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AvatarProps {
  name?: string | null;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, image, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(() => Date.now());

  useEffect(() => {
    setCacheBuster(Date.now());
    setImageError(false);
  }, [image]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2)
    : '?';

  if (image && !imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-secondary/30 flex-shrink-0 relative ${className}`}
      >
        <Image
          src={`${image}?t=${cacheBuster}`}
          alt="Avatar"
          fill
          sizes="(max-width: 768px) 48px, 96px"
          unoptimized
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center font-bold text-white border-2 border-secondary/30 flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
