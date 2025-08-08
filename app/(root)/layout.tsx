import { ReactNode } from "react";
import LeftSidebar from "./navigation/sidebar";

import TopBar from "./navigation/topbar";

import SessionProviders from "@/components/SessionProviders";

const RootLayout = ({ children }: { children: ReactNode }) => {
    return(
        <main className="">
          
            <div className="flex">
                <LeftSidebar/>
                <div className=" flex-col w-full">
                      <TopBar />
                      <section>
                        <SessionProviders>
                          {children}
                        </SessionProviders>
                      </section>
                </div>
                
            </div>
        </main>
    )
}

export default RootLayout;