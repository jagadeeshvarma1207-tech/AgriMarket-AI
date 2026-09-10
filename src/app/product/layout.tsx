import { Providers } from '@/app/providers'

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
