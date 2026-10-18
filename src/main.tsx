import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { classifyApiStatus } from '@/features/auth/authRules'
import { DemoAuthProvider } from '@/features/auth/DemoAuthProvider'
import '@/styles/global.scss'
import App from '@/App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        const disposition = classifyApiStatus(
          axios.isAxiosError(error) ? error.response?.status : undefined,
        )
        return disposition === undefined && failureCount < 1
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DemoAuthProvider>
        <App />
      </DemoAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)