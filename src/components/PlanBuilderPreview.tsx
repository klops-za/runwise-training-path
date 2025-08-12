import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo, useState } from 'react';

const raceOptions = [
  { value: '5K', weeks: 8 },
  { value: '10K', weeks: 10 },
  { value: 'Half Marathon', weeks: 12 },
  { value: 'Marathon', weeks: 16 },
];

export default function PlanBuilderPreview() {
  const [race, setRace] = useState<string>('10K');
  const [mileage, setMileage] = useState<number>(20);

  const preview = useMemo(() => {
    // Very lightweight demo week preview
    const easy = Math.max(3, Math.round(mileage * 0.25));
    const workout = Math.max(4, Math.round(mileage * 0.35));
    const longRun = Math.max(6, Math.round(mileage * 0.4));
    return [
      { day: 'Mon', type: 'Easy Run', miles: easy },
      { day: 'Tue', type: 'Workout (Intervals/Tempo)', miles: workout },
      { day: 'Wed', type: 'Rest or Cross-Train', miles: 0 },
      { day: 'Thu', type: 'Easy Run', miles: easy - 1 },
      { day: 'Fri', type: 'Recovery + Strides', miles: Math.max(2, Math.round(easy - 2)) },
      { day: 'Sat', type: 'Long Run', miles: longRun },
      { day: 'Sun', type: 'Rest', miles: 0 },
    ];
  }, [mileage]);

  const weeks = raceOptions.find(r => r.value === race)?.weeks ?? 10;

  return (
    <section aria-labelledby="preview-heading" className="mt-12">
      <Card className="border">
        <CardHeader>
          <CardTitle id="preview-heading" className="text-foreground">
            Plan Builder Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="race">Target Race</Label>
                <Select value={race} onValueChange={setRace}>
                  <SelectTrigger id="race" className="mt-1">
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                  <SelectContent>
                    {raceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">Approx. {weeks} weeks</p>
              </div>

              <div>
                <Label>Current Weekly Mileage: {mileage} km</Label>
                <Slider
                  value={[mileage]}
                  onValueChange={(v) => setMileage(v[0])}
                  min={10}
                  max={80}
                  step={1}
                  className="mt-3"
                />
                <p className="text-sm text-muted-foreground mt-2">We’ll adapt the plan to your base.</p>
              </div>
            </div>

            <div>
              <ul className="space-y-2">
                {preview.map((p) => (
                  <li key={p.day} className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm">
                    <span className="text-foreground font-medium">{p.day}</span>
                    <span className="text-muted-foreground">{p.type}</span>
                    <span className="text-primary font-semibold">{p.miles > 0 ? `${p.miles} km` : '—'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
