import { Card, CardContent } from '@/components/ui/card';
import { Trophy, ShieldCheck, Users } from 'lucide-react';

export default function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="mt-16">
      <h2 id="trust-heading" className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
        Trusted by thousands of runners
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border">
          <CardContent className="p-6 text-center">
            <Trophy className="mx-auto h-8 w-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground">5,000+</p>
            <p className="text-muted-foreground">Runners improving with RunWise</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-6 text-center">
            <Users className="mx-auto h-8 w-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground">92%</p>
            <p className="text-muted-foreground">Report smarter, safer training</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="p-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-foreground">4.8/5</p>
            <p className="text-muted-foreground">Average satisfaction rating</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
