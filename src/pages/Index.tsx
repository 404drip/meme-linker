import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getMemePages } from '@/lib/meme-api';
import type { MemePage } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';

const MemeCard = ({ meme }: { meme: MemePage }) => {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (hovered) {
      if (video) {
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 1;
        audio.play().catch(() => {});
      }
    } else {
      if (video) {
        video.pause();
        video.muted = true;
      }
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [hovered]);

  return (
    <Link to={`/m/${meme.slug}`}>
      <motion.div
        className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border shadow-lg cursor-pointer"
        style={{ backgroundColor: meme.background_color || undefined }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={() => setHovered(true)}
        onTouchEnd={() => setHovered(false)}
        whileHover={{ scale: 1.03, y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="relative aspect-video w-full bg-primary/10 overflow-hidden">
          {meme.video_url ? (
            <video
              ref={videoRef}
              src={meme.video_url}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : meme.image_url ? (
            <img
              src={meme.image_url}
              alt={meme.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-2xl sm:text-4xl font-black text-muted-foreground/30 uppercase tracking-widest">
                {meme.title.slice(0, 2)}
              </span>
            </div>
          )}

          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0.4 }}
            transition={{ duration: 0.3 }}
          />

          {meme.video_url && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 0 : 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-full bg-white/20 p-3 sm:p-4 backdrop-blur-sm">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: meme.background_color ? '#fff' : undefined }}>{meme.title}</h3>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm truncate" style={{ color: meme.background_color ? 'rgba(255,255,255,0.7)' : undefined }}>{meme.headline}</p>
        </div>
        {meme.audio_url && (
          <audio ref={audioRef} src={meme.audio_url} preload="metadata" />
        )}
      </motion.div>
    </Link>
  );
};

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [memes, setMemes] = useState<MemePage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMemePages()
      .then(all => setMemes(all.filter(m => m.status === 'published')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEnter = () => {
    // Unlock audio context on this user gesture
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {}
    setEntered(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="gate"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary"
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Glitch / noise overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />

            <motion.h1
              className="text-6xl font-black tracking-tighter text-primary-foreground sm:text-8xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              404chaos
            </motion.h1>

            <motion.p
              className="mt-4 text-lg text-primary-foreground/60 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              you've been warned
            </motion.p>

            <motion.button
              onClick={handleEnter}
              className="mt-12 rounded-full border-2 border-primary-foreground/30 bg-transparent px-12 py-4 text-lg font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary-foreground hover:text-primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Site
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Nav */}
            <header className="border-b border-border">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <h1 className="text-2xl font-extrabold tracking-tighter text-foreground" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  404chaos
                </h1>
                <Link
                  to="/admin/login"
                  className="text-muted-foreground/40 hover:text-foreground transition-colors"
                  title="Admin"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
              >
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
                  Browse Memes
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Hover to preview · Click to experience
                </p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : memes.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <p className="text-muted-foreground text-lg">No memes published yet</p>
                </div>
              ) : (
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.08 } },
                  }}
                >
                  {memes.map(meme => (
                    <motion.div
                      key={meme.id}
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      <MemeCard meme={meme} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
