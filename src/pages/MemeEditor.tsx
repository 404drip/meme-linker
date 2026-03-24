import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMemePage, createMemePage, updateMemePage, checkSlugAvailable } from '@/lib/meme-api';
import type { MemePageInsert } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultForm: MemePageInsert = {
  title: '',
  slug: '',
  headline: '',
  subtext: null,
  image_url: null,
  video_url: null,
  audio_url: null,
  background_color: null,
  theme: null,
  press_to_play: false,
  press_to_play_text: 'Press Me',
  cta_text: 'Buy Your Own',
  cta_url: '',
  cta_placement: 'below',
  status: 'draft',
};

const MemeEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<MemePageInsert>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      getMemePage(id).then(data => {
        if (data) {
          const { id: _, created_at, updated_at, ...rest } = data;
          setForm(rest);
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  const set = (key: keyof MemePageInsert, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleTitleChange = (title: string) => {
    set('title', title);
    if (isNew) {
      set('slug', generateSlug(title));
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.headline) {
      toast({ title: 'Missing fields', description: 'Title, slug, and headline are required', variant: 'destructive' });
      return;
    }

    const slugAvailable = await checkSlugAvailable(form.slug, isNew ? undefined : id);
    if (!slugAvailable) {
      toast({ title: 'Slug taken', description: 'This slug is already in use', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createMemePage(form);
        toast({ title: 'Meme created!' });
      } else {
        await updateMemePage(id!, form);
        toast({ title: 'Meme updated!' });
      }
      navigate('/admin');
    } catch (err: any) {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h1 className="text-lg font-bold tracking-tight">{isNew ? 'New Meme Page' : 'Edit Meme Page'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/m/${form.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview</Link>
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} size="sm">
              <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Funny Meme #1" />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">/m/</span>
                  <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="funny-meme-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Headline *</Label>
              <Input value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="When you realize..." />
            </div>
            <div className="space-y-2">
              <Label>Subtext</Label>
              <Textarea value={form.subtext || ''} onChange={(e) => set('subtext', e.target.value || null)} placeholder="Optional subtext" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Media</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.image_url || ''} onChange={(e) => set('image_url', e.target.value || null)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input value={form.video_url || ''} onChange={(e) => set('video_url', e.target.value || null)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Audio URL</Label>
              <Input value={form.audio_url || ''} onChange={(e) => set('audio_url', e.target.value || null)} placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Video Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Press to Play Mode</Label>
                <p className="text-sm text-muted-foreground">Show a big button before video plays with sound</p>
              </div>
              <Switch checked={form.press_to_play} onCheckedChange={(v) => set('press_to_play', v)} />
            </div>
            {form.press_to_play && (
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input value={form.press_to_play_text} onChange={(e) => set('press_to_play_text', e.target.value)} placeholder="Press Me" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={form.background_color || '#000000'} onChange={(e) => set('background_color', e.target.value)} className="w-14 h-10 p-1" />
                <Input value={form.background_color || ''} onChange={(e) => set('background_color', e.target.value || null)} placeholder="#000000" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={form.theme || 'dark'} onValueChange={(v) => set('theme', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Buy Button (CTA)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)} placeholder="Buy Your Own" />
            </div>
            <div className="space-y-2">
              <Label>Destination URL</Label>
              <Input value={form.cta_url} onChange={(e) => set('cta_url', e.target.value)} placeholder="https://your-store.com/product" />
            </div>
            <div className="space-y-2">
              <Label>Placement</Label>
              <Select value={form.cta_placement} onValueChange={(v) => set('cta_placement', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="below">Below Content</SelectItem>
                  <SelectItem value="sticky">Sticky Bottom</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MemeEditor;
