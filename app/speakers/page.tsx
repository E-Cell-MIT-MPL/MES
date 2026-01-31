'use client';

import { useEffect, useState } from 'react';
import PrismaticBurst from '@/components/PrismaticBurst';
import ProfileCard from '@/components/ProfileCard';

export default function SpeakersPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0E11] text-white">
      {/* PRISMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <PrismaticBurst
          colors={['#5227FF', '#FF9FFC', '#7CFF67']}
          intensity={0.45}
          speed={0.3}
          animationType="rotate3d"
          distort={0}
          hoverDampness={0}
          rayCount={0}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* CONTENT */}
      <main className="relative z-10">
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            {/* TITLE */}
            <h2
              className={`text-center text-4xl md:text-6xl font-black mb-16 transition-all duration-1000 ease-out
              ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              OUR SPEAKERS
            </h2>

            {/* SPEAKER GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
              <ProfileCard
                name="Speaker One"
                title="Keynote Speaker"
                avatarUrl="/spkr-mock3.jpg"
              />

              <ProfileCard
                name="Speaker Two"
                title="Guest Speaker"
                avatarUrl="/spkr-mock3.jpg"
              />

              <ProfileCard
                name="Speaker Three"
                title="Panelist"
                avatarUrl="/spkr-mock3.jpg"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
