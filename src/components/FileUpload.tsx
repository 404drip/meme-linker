import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  bucket: string;
  accept: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}

const FileUpload = ({ bucket, accept, value, onChange, label }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    try {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(urlData.publicUrl);
      toast({ title: `${label} uploaded` });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const isImage = accept.startsWith('image');
  const isVideo = accept.startsWith('video');
  const isAudio = accept.startsWith('audio');

  return (
    <div className="space-y-2">
      {value ? (
        <div className="space-y-2">
          {isImage && (
            <img src={value} alt={label} className="h-32 w-auto rounded-md border object-cover" />
          )}
          {isVideo && (
            <video src={value} className="h-32 w-auto rounded-md border" controls muted />
          )}
          {isAudio && (
            <audio src={value} controls className="w-full" />
          )}
          {!isImage && !isVideo && !isAudio && (
            <p className="truncate text-sm text-muted-foreground">{value}</p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Upload className="mr-2 h-3 w-3" />}
              Replace
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              <X className="mr-2 h-3 w-3" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? 'Uploading...' : `Upload ${label}`}
        </Button>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
    </div>
  );
};

export default FileUpload;
