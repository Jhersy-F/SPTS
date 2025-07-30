import { ReactNode } from "react";
import LeftSidebar from "./navigation/SideBar";

import TopBar from "./navigation/TopBar";


const RootLayout = ({ children }: { children: ReactNode }) => {
    return(
        <main className="">
          
            <div className="flex">
                <LeftSidebar/>
                <div className=" flex-col w-full">
                      <TopBar />
                      <section>
                    {children}
                    </section>
                </div>
                
            </div>
        </main>
    )
}

export default RootLayout;