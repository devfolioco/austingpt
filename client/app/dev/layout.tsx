import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_ENABLE_DEV_PAGES !== 'true') {
    notFound();
  }

  return <>{children}</>;
}
