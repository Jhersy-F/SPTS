export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: 'student' | 'instructor' | 'admin';
};

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  uploads: Array<{
    id: number;
    title: string;
    description: string;
    link: string;
  }>;
};
