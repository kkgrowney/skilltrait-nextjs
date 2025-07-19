'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NavPrelogin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="shadow-sm border-b w-full" style={{backgroundColor: '#212327', borderColor: '#454446'}}>
      <div className="w-full px-5">
        <div className="flex items-center h-16">
          {/* Logo - left justified with 20px margin to align with content */}
          <div className="flex-shrink-0" style={{marginLeft: '20px'}}>
            <Link href="/" className="flex items-center">
              <img 
                src="/skilltrait_dark.svg" 
                alt="SkillTrait" 
                className="h-6 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation - left justified with 36px padding from logo */}
          <div className="hidden md:flex items-center" style={{marginLeft: '36px'}}>
            <div className="flex items-center space-x-8">
              <Link 
                href="/achievements" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Achievements
              </Link>
              <Link 
                href="/award-templates" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Award Templates
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Login button - right justified with 20px margin */}
          <div className="hidden md:flex items-center ml-auto" style={{marginRight: '20px'}}>
            <Link 
              href="/signin" 
              className="px-4 py-2 rounded text-sm font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] hover:bg-[#0AFB84]"
            >
              Send free props
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t" style={{backgroundColor: '#212327', borderColor: '#454446'}}>
          <Link
            href="/achievements"
            className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Achievements
          </Link>
          <Link
            href="/award-templates"
            className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Award Templates
          </Link>
          <Link
            href="/pricing"
            className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/signin"
            className="block px-3 py-2 rounded text-base font-medium transition-colors bg-[var(--primary-dark)] text-[#212327] hover:bg-[#0AFB84]"
            onClick={() => setIsMenuOpen(false)}
          >
            Send free props
          </Link>
        </div>
      </div>
    </nav>
  );
} 