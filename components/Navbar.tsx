
"use client"; // Required if you're using Framer Motion and hooks in Next.js App Router

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Define the interface for your links
interface NavLink {
  name: string;
  href: string;
  type: 'anchor' | 'route';
}

const Navbar: React.FC = () => {
  const navLinks: NavLink[] = [
    { name: 'Speakers', href: '/#speakers', type: 'anchor' },
    { name: 'Events', href: '/#events', type: 'anchor' },
    { name: 'Timeline', href: '/#timeline', type: 'anchor' },
    { name: 'Passes', href: '/signup', type: 'route' }, 
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center">
      {/* Branding */}
      <Link href="/" className="text-2xl font-black tracking-tighter text-white">
        MES<span className="text-red-600">2026</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3 rounded-full">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="text-sm uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300 font-medium"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Brutal CTA Button */}
      <Link href="/signup">
        <motion.button
          whileHover={{ 
            scale: 1.05, 
            backgroundColor: "#dc2626", 
            color: "#fff" 
          }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block bg-white text-black px-8 py-2 font-bold uppercase text-xs tracking-tighter transition-all duration-300 rounded-sm"
        >
          Get Funding
        </motion.button>
      </Link>
    </nav>
  );
};

export default Navbar;