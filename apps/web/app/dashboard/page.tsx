import dynamic from 'next/dynamic';
import { Skeleton } from '@agora/ui';

const DashboardClient = dynamic(() => import('@/components/dashboard/DashboardClient').then((mod) => mod.DashboardClient), {
  ssr: false,
  loading: () => (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl"><Skeleton className="h-96 w-full" /></div>
    </section>
  ),
});

export default function DashboardPage() {
  return <DashboardClient />;
}
