'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';

interface ProfileData {
  id: number;
  name: string | null;
  username: string;
  email: string | null;
  image: string | null;
  stats: {
    aLer: number;
    lendo: number;
    lido: number;
    total: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Buscar dados do perfil
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/profile');

      if (!response.ok) {
        throw new Error('Erro ao buscar perfil');
      }

      const data = await response.json();
      setProfile(data);
      setEditingName(data.name || '');
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = profile?.stats ?? {
    aLer: 0,
    lendo: 0,
    lido: 0,
    total: 0,
  };

  const handleSaveName = async () => {
    if (!editingName.trim()) {
      setError('Nome não pode estar vazio');
      return;
    }

    try {
      setIsUpdating(true);
      setError('');

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar nome');
      }

      const data = await response.json();
      setProfile(data);
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar nome');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato não aceito. Use PNG, JPG, WEBP ou GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande (máx 5MB)');
      return;
    }

    try {
      setIsUploadingImage(true);
      setError('');

      // Upload do arquivo
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Erro no upload');
      }

      const uploadData = await uploadResponse.json();

      // Atualizar perfil com URL da imagem
      const updateResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadData.url }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao salvar imagem');
      }

      const profileData = await updateResponse.json();
      setProfile(profileData);
    } catch (err) {
      console.error(err);
      setError('Erro ao fazer upload da imagem');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
          <p className="mt-4 text-text-muted">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-text-muted">Erro ao carregar perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 border-b border-border-color">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Meu Perfil
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card border border-border-color rounded-lg p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with Upload */}
            <div className="relative group">
              <Avatar name={profile.username} image={profile.image} size="xl" />

              {/* Upload Button Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <span className="text-white text-xs font-medium">
                  {isUploadingImage ? 'Enviando...' : 'Trocar foto'}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadImage(file);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              {/* Name */}
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 bg-primary border border-border-color rounded text-white focus:outline-none focus:border-secondary"
                    placeholder="Seu nome"
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isUpdating}
                      className="w-full sm:w-auto px-4 py-1 bg-secondary/20 text-secondary hover:bg-secondary/30 rounded text-sm font-medium transition disabled:opacity-50"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditingName(profile.name || '');
                      }}
                      className="w-full sm:w-auto px-4 py-1 bg-border-color text-text-muted hover:text-white rounded text-sm font-medium transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="group flex items-start gap-2 hover:opacity-80 transition"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-white text-left">
                      {profile.name || 'Sem nome'}
                    </h2>
                    <p className="text-sm text-text-muted">@{profile.username}</p>
                  </div>
                  <span className="text-secondary/60 group-hover:text-secondary transition">
                    ✏️
                  </span>
                </button>
              )}

              {profile.email && <p className="text-sm text-text-muted">📧 {profile.email}</p>}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-color" />

          {/* Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Minha Biblioteca</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.aLer}</div>
                <div className="text-xs text-text-muted mt-1">A ler</div>
              </div>

              <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{stats.lendo}</div>
                <div className="text-xs text-text-muted mt-1">Lendo</div>
              </div>

              <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.lido}</div>
                <div className="text-xs text-text-muted mt-1">Lido</div>
              </div>

              <div className="bg-primary/50 border border-border-color rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-secondary">{stats.total}</div>
                <div className="text-xs text-text-muted mt-1">Total</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4 border-t border-border-color">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 transition font-medium"
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
