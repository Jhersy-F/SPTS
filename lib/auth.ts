import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SessionStrategy, DefaultSession, Account, Profile, Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import { AuthOptions } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string | null;
    firstName: string | null;
    studentNumber?: string | null;
    role: 'student' | 'instructor';
  }

  interface Session {
    user: User & DefaultSession['user'];
  }

  interface JWT {
    id: string;
    role: 'student' | 'instructor';
    emailVerified: Date | null;
    email: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Student Credentials',
      credentials: {
        studentNumber: { label: "Student Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const student = await prisma.student.findUnique({
          where: { studentNumber: credentials?.studentNumber }
        });

        if (!student) {
          throw new Error('Invalid student number');
        }

        if (!student.password) {
          throw new Error('No password found');
        }

        const isPasswordValid = await bcrypt.compare(credentials?.password || '', student.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: student.id.toString(), 
          name: `${student.firstName} ${student.lastName}`,
          firstName: student.firstName,
          lastName: student.lastName,
          studentNumber: student.studentNumber,
          role: 'student'
        };
      }
    }),
    CredentialsProvider({
      name: 'Instructor Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const instructor = await prisma.instructor.findUnique({
          where: { email: credentials?.email }
        });

        if (!instructor) {
          throw new Error('Invalid email');
        }

        if (!instructor.password) {
          throw new Error('No password found');
        }

        const isPasswordValid = await bcrypt.compare(credentials?.password || '', instructor.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: instructor.id.toString(), 
          email: instructor.email,
          name: instructor.name,
          firstName: instructor.firstName,
          role: 'instructor',
          emailVerified: null
        };
      }
    })
  ],
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login/student',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: import('next-auth').User | AdapterUser | null; }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'student' | 'instructor';
        token.emailVerified = user.emailVerified ? new Date(user.emailVerified) : null;
        token.email = user.email || '';
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT; user: AdapterUser }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'student' | 'instructor';
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.email = token.email || '';
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
