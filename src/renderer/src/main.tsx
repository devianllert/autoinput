import '@/renderer/shared/styles/global.css';

import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';

import { TooltipProvider } from '@/renderer/shared/ui/tooltip';

import { App } from './app';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delay={100}>
        <App />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
