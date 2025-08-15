"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import LeftSidebar from "./navigation/sidebar";
import TopBar from "./navigation/topbar";
import SessionProviders from "@/components/SessionProviders";

const RootLayout = ({ children }: { children: ReactNode }) => {
    return(
        <main className="">
            <SessionProviders>
                <LayoutContent>{children}</LayoutContent>
            </SessionProviders>
        </main>
    )
}

const LayoutContent = ({ children }: { children: ReactNode }) => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated" && session?.user;

    return (
        <div className="flex">
            {isAuthenticated && <LeftSidebar/>}
            <div className="flex-col w-full">
                {isAuthenticated && <TopBar />}
                <section>
                    {children}
                </section>
            </div>
        </div>
    );
}

export default RootLayout;