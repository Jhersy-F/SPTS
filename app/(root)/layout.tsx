import { ReactNode } from "react";
import LeftSidebar from "./navigation/SideBar";

import TopBar from "./navigation/TopBar";


const RootLayout = ({ children }: { children: ReactNode }) => {
    return(
        <main className="">
            <TopBar />
            <div className="flex">
                <LeftSidebar/>
                <section>
                    {children}
                </section>
            </div>
        </main>
    )
}

export default RootLayout;