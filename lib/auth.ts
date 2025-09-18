import CredentialsProvider from 'next-auth/providers/credentials';
import NextAuth from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SessionStrategy, DefaultSession, Session } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import { AuthOptions } from 'next-auth';
 

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'student' | 'instructor' | 'admin';
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    extensionName: string | null;
    studentNumber: string | null;
  }

  interface Session {
    user: User & DefaultSession['user'];
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
          name: [
            student.firstName,
            student.middleName,
            student.lastName,
            student.extensionName
          ].filter(Boolean).join(' '),
          firstName: student.firstName || null,
          middleName: student.middleName || null,
          lastName: student.lastName || null,
          extensionName: student.extensionName || null,
          studentNumber: student.studentNumber || null,
          role: 'student',
          email: null,
          emailVerified: null
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
          name: [
            instructor.firstName,
            instructor.middleName,
            instructor.lastName,
            instructor.extensionName
          ].filter(Boolean).join(' '),
          firstName: instructor.firstName || null,
          middleName: instructor.middleName || null,
          lastName: instructor.lastName || null,
          extensionName: instructor.extensionName || null,
          studentNumber: null,
          role: 'instructor',
          email: null,
          emailVerified: null
        };
      }
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const admin = await prisma.admin.findUnique({
          where: { username: credentials?.username },
        });

        if (!admin) {
          throw new Error('Invalid username');
        }

        if (!admin.password) {
          throw new Error('No password found');
        }

       // const isPasswordValid = await bcrypt.compare(credentials?.password || '', admin.password);
       // if (!isPasswordValid) {
        //  throw new Error('Invalid password');
       //}

        return {
          id: admin.adminID.toString(),
          name: admin.username,
          firstName: null,
          middleName: null,
          lastName: null,
          extensionName: null,
          studentNumber: null,
          role: 'admin',
          email: null,
          emailVerified: null
        };
      },
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
        token.role = user.role as 'student' | 'instructor' | 'admin';
        token.firstName = user.firstName;
        token.middleName = user.middleName;
        token.lastName = user.lastName;
        token.extensionName = user.extensionName;
        token.studentNumber = user.studentNumber;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        // Create name from available name parts
        const name = [
          token.firstName,
          token.middleName,
          token.lastName,
          token.extensionName
        ].filter(Boolean).join(' ');

        // Update session with user data
        session.user.id = token.id as string;
        session.user.role = token.role as 'student' | 'instructor' | 'admin';
        session.user.firstName = token.firstName as string | null;
        session.user.middleName = token.middleName as string | null;
        session.user.lastName = token.lastName as string | null;
        session.user.extensionName = token.extensionName as string | null;
        session.user.studentNumber = token.studentNumber as string | null;
        session.user.name = name || session.user.name || null;
      }
      return session;
    }
  }
};

const { auth, signIn, signOut } = NextAuth(authOptions);

export { auth, signIn, signOut };

