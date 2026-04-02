import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMemePageBySlug } from '@/lib/meme-api';
import type { MemePage } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

const CTAButton = ({ text, url, className }: { text: string; url: string; className?: string }) => (
  <motion.a
    href={url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-block rounded-full bg-white px-10 py-4 text-lg font-bold tracking-wide text-black transition-colors hover:bg-white/90 active:scale-95 ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {text || 'Buy Your Own'}
  </motion.a>
);

const PublicMemePage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<MemePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const usePressToPlay = !!(page?.press_to_play && page?.video_url);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    getMemePageBySlug(slug).then(data => {
      if (!data) setNotFound(true);
      else setPage(data);
      setLoading(false);
    });
  }, [slug]);

  const handlePressToPlay = () => {
    setRevealed(true);
    setVideoPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 50);
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-white border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black text-white">
        <motion.p
          className="text-8xl font-black"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          404
        </motion.p>
        <motion.p
          className="mt-4 text-xl text-white/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          This page doesn't exist
        </motion.p>
      </div>
    );
  }

  const bgColor = page.background_color || '#000000';
  const showStickyButton = page.cta_placement === 'sticky' || page.cta_placement === 'both';
  const showInlineButton = page.cta_placement === 'below' || page.cta_placement === 'both';

  // Full-screen "Press Me" gate
  if (usePressToPlay && !revealed) {
    return (
      <div
        className="flex min-h-[100dvh] flex-col items-center justify-center px-4"
        style={{ backgroundColor: bgColor }}
      >
        {/* Hidden video preloading in background */}
        <video
          ref={videoRef}
          src={page.video_url!}
          className="hidden"
          playsInline
          preload="auto"
          muted
          loop
        />
        {page.audio_url && <audio ref={audioRef} src={page.audio_url} loop className="hidden" />}

        <motion.button
          onClick={handlePressToPlay}
          className="flex h-72 w-full max-w-md items-center justify-center rounded-3xl border-4 border-white/30 bg-white/5 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="text-4xl font-black tracking-wider text-white drop-shadow-lg"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            {page.press_to_play_text || 'Press Me'}
          </motion.span>
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex w-full max-w-lg flex-col items-center gap-8 py-12 text-center">
        {/* Headline */}
        <motion.h1
          className="text-5xl font-black leading-[1.1] tracking-tighter text-white sm:text-6xl md:text-7xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.1 }}
        >
          {page.headline}
        </motion.h1>

        {/* Subtext */}
        {page.subtext && (
          <motion.p
            className="max-w-md text-lg text-white/60"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {page.subtext}
          </motion.p>
        )}

        {/* Image */}
        {page.image_url && (
          <motion.img
            src={page.image_url}
            alt={page.headline}
            className="w-full max-w-md rounded-2xl shadow-2xl shadow-white/5"
            loading="eager"
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 80, delay: 0.3 }}
          />
        )}

        {/* Video */}
        {page.video_url && (
          <motion.div
            className="w-full max-w-md aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl shadow-white/5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 80, delay: 0.2 }}
          >
            <video
              ref={videoRef}
              src={page.video_url}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="auto"
              autoPlay
              loop
            />
          </motion.div>
        )}

        {/* Audio */}
        {page.audio_url && (
          <audio ref={audioRef} src={page.audio_url} loop />
        )}

        {/* Inline CTA */}
        {showInlineButton && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <CTAButton text={page.cta_text} url={page.cta_url} />
          </motion.div>
        )}
      </div>

      {/* Sticky CTA */}
      {showStickyButton && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 flex justify-center p-4 pb-6"
          style={{ background: `linear-gradient(transparent, ${bgColor})` }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1, type: 'spring', damping: 20 }}
        >
          <CTAButton text={page.cta_text} url={page.cta_url} className="w-full max-w-md text-center shadow-xl" />
        </motion.div>
      )}
    </div>
  );
};

export default PublicMemePage;
