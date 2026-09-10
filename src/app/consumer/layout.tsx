import { Providers } from '@/app/providers'

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
