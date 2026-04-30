import { BuiltOn } from '@/components/landing/BuiltOn';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LiveStats } from '@/components/landing/LiveStats';
import { SubscribeBand } from '@/components/site/SubscribeBand';

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <LiveStats />
      <HowItWorks />
      <BuiltOn />
      <FeatureGrid />
      <SubscribeBand />
    </>
  );
}
