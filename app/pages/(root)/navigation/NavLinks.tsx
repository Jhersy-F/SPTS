"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants/links";
import { cn } from "@/lib/utils";

const NavLinks = ({
  isMobileNav = false,
  userId,
}: {
  isMobileNav?: boolean;
  userId?: string;
}) => {
  const pathname = usePathname();

  return (
    <>
      {sidebarLinks.map((item) => {
        // Create a copy of the item to avoid mutating the original
        const linkItem = { ...item };
        
        // Handle profile route with userId
        if (linkItem.route === "/profile") {
          if (userId) {
            linkItem.route = `${linkItem.route}`;
          } else {
            return null;
          }
        }

        const isActive =
          (pathname.includes(linkItem.route) && linkItem.route.length > 1) ||
          pathname === linkItem.route;

        const LinkComponent = (
          <Link
            href={linkItem.route}
            key={linkItem.label}
            className={cn(
              "gap-5 bg-transparent text-white",
              isActive && "primary-gradient rounded-lg"
            )}
          >
            <p
              className={cn(
                "max-lg:hidden",
                isActive ? "base-bold" : "base-medium"
              )}
            >
              {linkItem.label}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild key={linkItem.route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={linkItem.route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
