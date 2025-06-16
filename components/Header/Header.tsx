// components/Header/Header.tsx
import Image from 'next/image';
import Link from 'next/link';
import { CUIBanner } from './CUIBanner';
import { NavLink } from './NavLink';

export const Header = () => {
  return (
    <>
      <CUIBanner />
      <header className="fixed top-8 left-0 right-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" legacyBehavior>
              <a className="flex items-center">
                <Image
                  src="/images/1.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="w-auto h-auto" // Prevents aspect ratio distortion
                  priority
                />
              </a>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <NavLink href="/documentation" active>
                Documentation
              </NavLink>
              <NavLink href="/learn">
                Learn
              </NavLink>
              <NavLink href="/examples">
                Examples
              </NavLink>
              <NavLink href="/start">
                Start
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};