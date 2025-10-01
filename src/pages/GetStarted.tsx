
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const GetStarted = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goal_plan: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
const { toast } = useToast();

  // SEO: title, meta description, canonical
  useEffect(() => {
    document.title = "Get Free Running Plan | MyBestRunning";
    const desc = "Get a free Couch-to-5K or 5K training plan instantly.";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    const canonicalHref = `${window.location.origin}/get-started`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.goal_plan) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: formData.name,
          email: formData.email,
          goal_plan: formData.goal_plan,
          source: 'free-plan'
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Email Already Used",
            description: "This email is already registered. Redirecting to your plan...",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "Your free plan is ready. Redirecting...",
        });
      }

      // Redirect to free plans page with selected plan
      setTimeout(() => {
        navigate(`/plans/free?plan=${encodeURIComponent(formData.goal_plan)}`);
      }, 1000);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-orange-50 dark:from-blue-950 dark:via-background dark:to-orange-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎽 Get Your Free Running Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access a beginner-friendly Couch-to-5K or 5K plan instantly. No payment, just your email.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Instant Access</h3>
            <p className="text-sm text-muted-foreground">Get your plan immediately after signup</p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Beginner Friendly</h3>
            <p className="text-sm text-muted-foreground">Perfect for new runners or returning athletes</p>
          </div>
          <div className="text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Proven Methods</h3>
            <p className="text-sm text-muted-foreground">Based on successful training principles</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Start Your Running Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your first name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="goal_plan">Choose Your Plan</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, goal_plan: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a training plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Couch-to-5K">Couch-to-5K (8 weeks)</SelectItem>
                      <SelectItem value="5K Beginner">5K Beginner (6 weeks)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Getting Your Plan...' : 'Get My Plan'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
