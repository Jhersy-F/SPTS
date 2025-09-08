'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

const nav = [
  { href: '/instructor/dashboard', label: 'Home' },
  { href: '/instructor/subjects', label: 'My Subjects' },
  { href: '/instructor/profile', label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <section className="custom-scrollbar bg-[#145cc2] light-border sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-16 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px] items-center">
      <Image
        src="/images/logopsu.png"
        alt="PSU Logo"
        width={100}
        height={100}
        className="object-contain pb-16"
      />

      <nav className="flex flex-1 flex-col gap-4 items-center w-full">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                'w-full text-center rounded-lg px-4 py-3 text-white ' +
                (active ? 'primary-gradient' : 'bg-transparent hover:bg-white/10')
              }
            >
              <span className={active ? 'base-bold' : 'base-medium'}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 w-full">
        <form
          action={() => {
            signOut({ callbackUrl: '/' });
          }}
        >
          <Button type="submit" className="base-medium w-full !bg-transparent px-4 py-3 cursor-pointer text-white">
            Logout
          </Button>
        </form>
      </div>
    </section>
  );
}
