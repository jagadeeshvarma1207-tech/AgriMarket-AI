import { Providers } from '@/app/providers'

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
