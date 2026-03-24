import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQRCode, createQRCode, updateQRCode, checkCodeAvailable } from '@/lib/qr-api';
import { getMemePages } from '@/lib/meme-api';
import type { QRCodeInsert, MemePage } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultForm: QRCodeInsert = {
  name: '',
  code: '',
  meme_page_id: null,
  active: true,
  notes: null,
};

const QRCodeEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<QRCodeInsert>(defaultForm);
  const [memes, setMemes] = useState<MemePage[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const pages = await getMemePages();
      setMemes(pages);
      if (!isNew && id) {
        const data = await getQRCode(id);
        if (data) {
          const { id: _, created_at, updated_at, ...rest } = data;
          setForm(rest);
        }
      }
      setLoading(false);
    };
    load();
  }, [id, isNew]);

  const set = (key: keyof QRCodeInsert, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast({ title: 'Missing fields', description: 'Name and code are required', variant: 'destructive' });
      return;
    }

    const codeAvailable = await checkCodeAvailable(form.code, isNew ? undefined : id);
    if (!codeAvailable) {
      toast({ title: 'Code taken', description: 'This code is already in use', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createQRCode(form);
        toast({ title: 'QR code created!' });
      } else {
        await updateQRCode(id!, form);
        toast({ title: 'QR code updated!' });
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
            <h1 className="text-lg font-bold tracking-tight">{isNew ? 'New QR Code' : 'Edit QR Code'}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">QR Code Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Internal Name *</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Shirt #42 - Blue Edition" />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">/q/</span>
                <Input value={form.code} onChange={(e) => set('code', e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))} placeholder="shirt42" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Linked Meme Page</Label>
              <Select value={form.meme_page_id || 'none'} onValueChange={(v) => set('meme_page_id', v === 'none' ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select a meme page" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked page</SelectItem>
                  {memes.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.title} (/m/{m.slug})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={form.active} onCheckedChange={(v) => set('active', v)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value || null)} placeholder="Optional notes..." />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QRCodeEditor;
