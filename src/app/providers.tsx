'use client';

import { HumanBehaviorProvider } from 'humanbehavior-js/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HumanBehaviorProvider apiKey={process.env.NEXT_PUBLIC_HUMANBEHAVIOR_API_KEY}>
      {children}
    </HumanBehaviorProvider>
  );
}