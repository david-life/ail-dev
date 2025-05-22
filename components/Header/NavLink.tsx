import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}

const NavLink = ({ href, children, active }: NavLinkProps) => {
  return (
    <Link href={href} legacyBehavior>
      <a
        className={`
          text-sm font-medium transition-colors duration-200
          ${active 
            ? 'text-gray-900 font-semibold' 
            : 'text-gray-600 hover:text-gray-900'}
        `}
      >
        {children}
      </a>
    </Link>
  );
};

export { NavLink };