import 'next-auth';

// Extend the default session interface to include our custom properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'instructor' | 'admin';
      firstName: string | null;
      middleName: string | null;
      lastName: string | null;
      extensionName: string | null;
      studentNumber: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }
  
  interface User {
    id: string;
    role: 'student' | 'instructor' | 'admin';
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    extensionName: string | null;
    studentNumber: string | null;
  }

  interface JWT {
    id: string;
    role: 'student' | 'instructor' | 'admin';
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    extensionName: string | null;
    studentNumber: string | null;
  }
}
