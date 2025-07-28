import Image from "next/image";
import { ReactNode } from "react";



const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className=" flex-row min-h-screen items-center justify-center bg-auth-light bg-cover bg-center bg-no-repeat px-4 py-10 dark:bg-auth-dark justify-items-center">
      <section >
        <div className="flex items-center justify-center mb-8 space-x-2">
              <Image
            src="/images/logopsu.png"
            alt="DevFlow Logo"
            width={100}
            height={100}
            className="object-contain"
          />
          <div className="space-y-1">
            <h1 className="h1-bold text-dark100_light900 text-2xl">PANGASINAN STATE UNIVERSITY</h1>
           
          </div>
          
        </div>
        <p className="font-bold text-dark500_light400 mb-8 text text-lg">
              STUDENT PERFORMANCE TRACKING SYSTEM FOR COMPUTER SCIENCE STUDENTS OF PSULC
            </p>
      </section>
      <section className="light-border background-light800_dark200 shadow-light100_dark100 min-w-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-[400px] sm:px-8 w-[500px] self-center">
        

        {children}

      </section>
    </main>
  );
};

export default AuthLayout;