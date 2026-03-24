import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getMemePages } from '@/lib/meme-api';
import { getQRCodes } from '@/lib/qr-api';
import { deleteMemePage, updateMemePage } from '@/lib/meme-api';
import { deleteQRCode } from '@/lib/qr-api';
import type { MemePage, QRCode } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, ExternalLink, LogOut, Search } from 'lucide-react';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [memes, setMemes] = useState<MemePage[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [m, q] = await Promise.all([getMemePages(), getQRCodes()]);
      setMemes(m);
      setQRCodes(q);
    } catch (err: any) {
      toast({ title: 'Error loading data', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredMemes = memes.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteMeme = async (id: string) => {
    if (!confirm('Delete this meme page?')) return;
    try {
      await deleteMemePage(id);
      setMemes(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Meme deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (meme: MemePage) => {
    const newStatus = meme.status === 'published' ? 'draft' : 'published';
    try {
      await updateMemePage(meme.id, { status: newStatus });
      setMemes(prev => prev.map(m => m.id === meme.id ? { ...m, status: newStatus } : m));
      toast({ title: `Meme ${newStatus}` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteQR = async (id: string) => {
    if (!confirm('Delete this QR code?')) return;
    try {
      await deleteQRCode(id);
      setQRCodes(prev => prev.filter(q => q.id !== id));
      toast({ title: 'QR code deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getMemeTitle = (memeId: string | null) => {
    if (!memeId) return '—';
    return memes.find(m => m.id === memeId)?.title || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight">QR Meme Admin</h1>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="memes">
          <TabsList>
            <TabsTrigger value="memes">Meme Pages ({memes.length})</TabsTrigger>
            <TabsTrigger value="qrcodes">QR Codes ({qrCodes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="memes" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search memes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <div className="flex gap-1">
                  {(['all', 'draft', 'published'] as const).map(s => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(s)}
                    >
                      {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <Button asChild>
                <Link to="/admin/memes/new"><Plus className="mr-2 h-4 w-4" /> New Meme</Link>
              </Button>
            </div>

            {filteredMemes.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">No meme pages yet</p>
                <Button asChild className="mt-4">
                  <Link to="/admin/memes/new"><Plus className="mr-2 h-4 w-4" /> Create your first meme</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMemes.map(meme => (
                      <TableRow key={meme.id}>
                        <TableCell className="font-medium">{meme.title}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">/m/{meme.slug}</TableCell>
                        <TableCell>
                          <Badge
                            variant={meme.status === 'published' ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => handleToggleStatus(meme)}
                          >
                            {meme.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(meme.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild title="Preview">
                              <Link to={`/m/${meme.slug}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild title="Edit">
                              <Link to={`/admin/memes/${meme.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMeme(meme.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="qrcodes" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Manage QR code redirects</p>
              <Button asChild>
                <Link to="/admin/qrcodes/new"><Plus className="mr-2 h-4 w-4" /> New QR Code</Link>
              </Button>
            </div>

            {qrCodes.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">No QR codes yet</p>
                <Button asChild className="mt-4">
                  <Link to="/admin/qrcodes/new"><Plus className="mr-2 h-4 w-4" /> Create your first QR code</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Linked Meme</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qrCodes.map(qr => (
                      <TableRow key={qr.id}>
                        <TableCell className="font-medium">{qr.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">/q/{qr.code}</TableCell>
                        <TableCell className="text-sm">{getMemeTitle(qr.meme_page_id)}</TableCell>
                        <TableCell>
                          <Badge variant={qr.active ? 'default' : 'secondary'}>
                            {qr.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild title="Test">
                              <Link to={`/q/${qr.code}`} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild title="Edit">
                              <Link to={`/admin/qrcodes/${qr.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteQR(qr.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
