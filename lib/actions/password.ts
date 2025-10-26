import bcrypt from 'bcryptjs';

export async function generateDefaultPassword(lastName: string): Promise<string> {
  const defaultPassword = `${lastName}@123`;
  return await bcrypt.hash(defaultPassword, 10);
}

export function createDefaultPassword(lastName: string): string {
  return `${lastName}@123`;
}