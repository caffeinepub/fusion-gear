import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile({ name: name.trim() });
      toast.success('Profile saved! Welcome to FUSION GEAR.');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="bg-garage-card border-garage-border max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-amber/10 border border-amber/30">
              <Wrench className="h-8 w-8 text-amber" />
            </div>
          </div>
          <DialogTitle className="font-heading text-2xl text-center text-foreground">
            Welcome to FUSION GEAR
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter your name to set up your profile
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajan Kumar"
              className="bg-input border-garage-border text-foreground h-12 text-base"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full h-12 bg-amber text-primary-foreground font-semibold hover:bg-amber-light text-base"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
