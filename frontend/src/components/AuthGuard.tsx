import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Link } from '@tanstack/react-router';
import { Wrench, LogIn, Loader2 } from 'lucide-react';
import ProfileSetupModal from './ProfileSetupModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-amber animate-spin" />
          <p className="text-muted-foreground font-heading text-lg">Loading FUSION GEAR...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-amber/10 border border-amber/30">
              <Wrench className="h-12 w-12 text-amber" />
            </div>
          </div>
          <h2 className="font-heading text-3xl font-bold text-foreground mb-2">FUSION GEAR</h2>
          <p className="text-muted-foreground mb-6">Professional Bike Garage Management</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber text-primary-foreground font-semibold rounded hover:bg-amber-light transition-colors touch-target"
          >
            <LogIn className="h-5 w-5" />
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      {children}
    </>
  );
}
