import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Allow public routes
  if (request.nextUrl.pathname.startsWith('/login/student') || 
      request.nextUrl.pathname.startsWith('/register')) {
    return NextResponse.next(); 
  }
  
  // Check if token exists
  if (!token) {
   // return NextResponse.redirect(new URL('/login/student', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
