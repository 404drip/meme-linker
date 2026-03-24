import { supabase } from './supabase';
import type { MemePage, MemePageInsert, MemePageUpdate } from '@/types/database';

export async function getMemePages(): Promise<MemePage[]> {
  const { data, error } = await supabase
    .from('meme_pages')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getMemePage(id: string): Promise<MemePage | null> {
  const { data, error } = await supabase
    .from('meme_pages')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getMemePageBySlug(slug: string): Promise<MemePage | null> {
  const { data, error } = await supabase
    .from('meme_pages')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data;
}

export async function createMemePage(page: MemePageInsert): Promise<MemePage> {
  const { data, error } = await supabase
    .from('meme_pages')
    .insert(page)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMemePage(id: string, updates: MemePageUpdate): Promise<MemePage> {
  const { data, error } = await supabase
    .from('meme_pages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMemePage(id: string): Promise<void> {
  const { error } = await supabase
    .from('meme_pages')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('meme_pages').select('id').eq('slug', slug);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  return !data || data.length === 0;
}
