import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const QRRedirect = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) { setError(true); return; }

    const redirect = async () => {
      const { data, error: err } = await supabase
        .from('qr_codes')
        .select('active, meme_page_id, meme_pages(slug)')
        .eq('code', code)
        .single();

      if (err || !data || !data.active || !data.meme_page_id) {
        setError(true);
        return;
      }

      const meme = data.meme_pages as any;
      if (meme?.slug) {
        navigate(`/m/${meme.slug}`, { replace: true });
      } else {
        setError(true);
      }
    };

    redirect();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-4xl font-bold">🤷</p>
        <p className="mt-4 text-lg text-white/60">This QR code isn't active</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
};

export default QRRedirect;
