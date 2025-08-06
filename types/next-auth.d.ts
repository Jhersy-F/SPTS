import 'next-auth';

// Extend the default session interface to include our custom properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
  interface User {
    id: string;
    role: string;
  }
}
