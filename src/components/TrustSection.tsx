import { Card, CardContent } from '@/components/ui/card';
import { Trophy, ShieldCheck, Users } from 'lucide-react';

export default function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="mt-16">
      <h2 id="trust-heading" className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
        Why runners choose MyBestRunning
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border">
          <CardContent className="p-6 text-center">
            <Trophy className="mx-auto h-8 w-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground">Science-Based</p>
            <p className="text-muted-foreground">Training plans built on proven coaching principles</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto h-8 w-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground">Personalized</p>
            <p className="text-muted-foreground">Plans that adapt to your fitness and schedule</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground">Injury Prevention</p>
            <p className="text-muted-foreground">Smart pacing to keep you healthy and strong</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
