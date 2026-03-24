import { supabase } from './supabase';
import type { QRCode, QRCodeInsert, QRCodeUpdate } from '@/types/database';

export async function getQRCodes(): Promise<QRCode[]> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getQRCode(id: string): Promise<QRCode | null> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getQRCodeByCode(code: string): Promise<QRCode | null> {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*, meme_pages(slug)')
    .eq('code', code)
    .eq('active', true)
    .single();
  if (error) return null;
  return data;
}

export async function createQRCode(qr: QRCodeInsert): Promise<QRCode> {
  const { data, error } = await supabase
    .from('qr_codes')
    .insert(qr)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateQRCode(id: string, updates: QRCodeUpdate): Promise<QRCode> {
  const { data, error } = await supabase
    .from('qr_codes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQRCode(id: string): Promise<void> {
  const { error } = await supabase
    .from('qr_codes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function checkCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('qr_codes').select('id').eq('code', code);
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query;
  return !data || data.length === 0;
}
