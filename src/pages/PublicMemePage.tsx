import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMemePageBySlug } from '@/lib/meme-api';
import type { MemePage } from '@/types/database';

const CTAButton = ({ text, url, className }: { text: string; url: string; className?: string }) => (
  <a
    href={url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-block rounded-full px-8 py-4 text-lg font-bold tracking-wide transition-transform active:scale-95 ${className}`}
    style={{ backgroundColor: '#fff', color: '#000' }}
  >
    {text || 'Buy Your Own'}
  </a>
);

const PublicMemePage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<MemePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getMemePageBySlug(slug).then(data => {
      if (!data) setNotFound(true);
      else setPage(data);
      setLoading(false);
    });
  }, [slug]);

  const handlePressToPlay = () => {
    setVideoPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.play();
      }
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-6xl font-bold">404</p>
        <p className="mt-2 text-xl text-white/60">Page not found</p>
      </div>
    );
  }

  const bgColor = page.background_color || (page.theme === 'light' ? '#ffffff' : page.theme === 'neon' ? '#0a0a0a' : '#000000');
  const textColor = page.theme === 'light' ? '#000000' : '#ffffff';
  const showStickyButton = page.cta_placement === 'sticky' || page.cta_placement === 'both';
  const showInlineButton = page.cta_placement === 'below' || page.cta_placement === 'both';

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        {/* Headline */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {page.headline}
        </h1>

        {/* Subtext */}
        {page.subtext && (
          <p className="text-lg opacity-70">{page.subtext}</p>
        )}

        {/* Image */}
        {page.image_url && (
          <img src={page.image_url} alt={page.title} className="w-full max-w-md rounded-lg" loading="eager" />
        )}

        {/* Video with press-to-play */}
        {page.video_url && page.press_to_play && !videoPlaying && (
          <button
            onClick={handlePressToPlay}
            className="relative flex h-64 w-full max-w-md items-center justify-center rounded-2xl border-4 border-dashed transition-all active:scale-95"
            style={{ borderColor: textColor, color: textColor }}
          >
            <span className="text-3xl font-extrabold tracking-wide animate-pulse">
              {page.press_to_play_text || 'Press Me'}
            </span>
          </button>
        )}

        {/* Video player */}
        {page.video_url && (!page.press_to_play || videoPlaying) && (
          <video
            ref={videoRef}
            src={page.video_url}
            className="w-full max-w-md rounded-lg"
            controls
            playsInline
            autoPlay={!page.press_to_play}
            muted={!page.press_to_play}
            loop
          />
        )}

        {/* Audio */}
        {page.audio_url && (
          <audio ref={audioRef} src={page.audio_url} loop />
        )}

        {/* Inline CTA */}
        {showInlineButton && (
          <div className="mt-4">
            <CTAButton text={page.cta_text} url={page.cta_url} />
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4" style={{ backgroundColor: `${bgColor}ee` }}>
          <CTAButton text={page.cta_text} url={page.cta_url} className="w-full max-w-md text-center" />
        </div>
      )}
    </div>
  );
};

export default PublicMemePage;
