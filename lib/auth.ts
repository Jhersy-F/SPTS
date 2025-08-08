import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SessionStrategy, DefaultSession, Session } from 'next-auth';
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
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'student-credentials',
      name: 'Student Credentials',
      credentials: {
        studentNumber: { label: "Student Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
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
      id: 'instructor-credentials',
      name: 'Instructor Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const instructor = await prisma.instructor.findUnique({
          where: { username: credentials?.username }
        });

        if (!instructor) {
          throw new Error('Invalid username');
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
          name: `${instructor.firstName} ${instructor.lastName}`,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
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
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT; user: AdapterUser }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'student' | 'instructor';
      }
      return session;
    }
  }
};

