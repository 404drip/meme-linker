import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight">QR Meme</h1>
      <p className="mt-3 text-lg text-muted-foreground">T-shirt QR code landing page manager</p>
      <Button asChild className="mt-8" size="lg">
        <Link to="/admin">Admin Dashboard →</Link>
      </Button>
    </div>
  );
};

export default Index;
