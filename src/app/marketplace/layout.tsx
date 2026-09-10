import { Providers } from '@/app/providers'

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
