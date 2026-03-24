export interface MemePage {
  id: string;
  title: string;
  slug: string;
  headline: string;
  subtext: string | null;
  image_url: string | null;
  video_url: string | null;
  audio_url: string | null;
  background_color: string | null;
  theme: string | null;
  press_to_play: boolean;
  press_to_play_text: string;
  cta_text: string;
  cta_url: string;
  cta_placement: 'below' | 'sticky' | 'both';
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface QRCode {
  id: string;
  name: string;
  code: string;
  meme_page_id: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type MemePageInsert = Omit<MemePage, 'id' | 'created_at' | 'updated_at'>;
export type MemePageUpdate = Partial<MemePageInsert>;
export type QRCodeInsert = Omit<QRCode, 'id' | 'created_at' | 'updated_at'>;
export type QRCodeUpdate = Partial<QRCodeInsert>;
