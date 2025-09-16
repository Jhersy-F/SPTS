import 'next-auth';

// Extend the default session interface to include our custom properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      extensionName?: string;
      studentNumber?: string;
    } & DefaultSession['user'];
  }
  
  interface User {
    id: string;
    role: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    extensionName?: string;
    studentNumber?: string;
  }
}
