import React from "react";
import Link from "next/link";

const home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8">Welcome to SPTS</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Student Registration</h2>
              <Link 
                href="/register"
                className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 text-center"
              >
                Register as Student
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              <Link 
                href="/login/student"
                className="block w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 text-center"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default home;