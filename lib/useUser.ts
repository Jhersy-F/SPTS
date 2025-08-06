import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User } from '@/types';

export function useUser() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User);
    } else {
      setUser(null);
    }
  }, [session]);

  return { user };
}
