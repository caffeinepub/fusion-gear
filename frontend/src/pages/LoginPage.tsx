import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, Wrench, Shield, BarChart3, FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  const features = [
    { icon: FileText, text: 'Create & manage invoices' },
    { icon: Wrench, text: 'Track services & repairs' },
    { icon: BarChart3, text: 'Analytics dashboard' },
    { icon: Shield, text: 'Secure on-chain storage' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/generated/fusion-gear-logo.dim_512x512.png"
              alt="FUSION GEAR"
              className="h-20 w-20 rounded-lg object-cover border-2 border-amber/40"
            />
          </div>
          <h1 className="font-heading text-4xl font-bold text-amber tracking-wider">FUSION GEAR</h1>
          <p className="text-muted-foreground mt-1">Professional Bike Garage Management</p>
        </div>

        {/* Features */}
        <div className="bg-garage-card border border-garage-border rounded-lg p-4 mb-6 space-y-3">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-amber flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <button
          onClick={login}
          disabled={isLoggingIn}
          className="w-full h-14 bg-amber text-primary-foreground font-heading font-bold text-lg rounded hover:bg-amber-light transition-colors disabled:opacity-60 flex items-center justify-center gap-3 touch-target"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Login Securely
            </>
          )}
        </button>

        {loginStatus === 'loginError' && (
          <p className="text-destructive text-sm text-center mt-3">
            Login failed. Please try again.
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          Secured by Internet Identity
        </p>
      </div>
    </div>
  );
}
