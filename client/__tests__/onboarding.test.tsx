import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Onboarding from '@/pages/onboarding';
import { describe, it, expect } from 'vitest';

// simple wrapper to avoid errors due to hooks requiring context
function renderOnboarding() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Onboarding />
    </QueryClientProvider>
  );
}

describe('Onboarding Page', () => {
  it('shows the create plan button', () => {
    renderOnboarding();
    expect(screen.getByRole('button', { name: /create my workout plan/i })).toBeInTheDocument();
  });
});
