import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase não configurado - usando storage local');
    return null;
  }

  // Validar formato básico do JWT (deve ter 3 partes separadas por pontos)
  const jwtParts = supabaseServiceKey.split('.');
  if (jwtParts.length !== 3) {
    console.error('SUPABASE_SERVICE_ROLE_KEY inválida - formato JWT incorreto');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    return null;
  }
}
