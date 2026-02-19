'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { BookCover } from './BookCover';

interface BookCoverUploadProps {
  title: string;
  currentCoverUrl?: string | null;
  onCoverChange: (url: string, source: 'api' | 'upload' | 'manual') => void;
  onRemoveCover: () => void;
}

export function BookCoverUpload({
  title,
  currentCoverUrl,
  onCoverChange,
  onRemoveCover,
}: BookCoverUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simular upload de arquivo (salvar em local temporário)
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Criar FormData e enviar para API de upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();
      onCoverChange(data.url, 'upload');
      setShowManualUrl(false);
    } catch (err) {
      setError('Erro ao fazer upload da imagem. Tente novamente.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Processar URL manual
  const handleManualUrlSubmit = () => {
    if (!manualUrl.trim()) {
      setError('Por favor, forneça uma URL válida');
      return;
    }

    try {
      new URL(manualUrl);
      onCoverChange(manualUrl, 'manual');
      setManualUrl('');
      setShowManualUrl(false);
      setError('');
    } catch {
      setError('URL inválida. Por favor, verifique a URL fornecida.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Prévia da capa */}
      <div className="rounded-lg overflow-hidden border border-border-color">
        <BookCover title={title} coverUrl={currentCoverUrl} className="h-64" />
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 py-2 px-3 rounded bg-secondary/10 text-secondary hover:bg-secondary/20 transition text-sm font-medium disabled:opacity-50"
        >
          {isUploading ? 'Enviando...' : '📤 Upload'}
        </button>

        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="flex-1 py-2 px-3 rounded bg-accent/10 text-accent hover:bg-accent/20 transition text-sm font-medium"
        >
          🔗 URL
        </button>

        {currentCoverUrl && (
          <button
            type="button"
            onClick={onRemoveCover}
            className="py-2 px-3 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm font-medium"
          >
            ✕ Remover
          </button>
        )}
      </div>

      {/* Campo de entrada para URL manual */}
      {showManualUrl && (
        <div className="p-3 rounded bg-primary border border-border-color space-y-2">
          <label className="block text-xs font-semibold text-text-muted uppercase">
            URL da Imagem
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-primary border border-border-color rounded text-white text-sm focus:outline-none focus:border-secondary"
            />
            <button
              type="button"
              onClick={handleManualUrlSubmit}
              disabled={!manualUrl.trim()}
              className="py-2 px-4 rounded bg-secondary text-white text-sm font-medium hover:brightness-110 transition disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Input de arquivo (oculto) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
    </div>
  );
}
