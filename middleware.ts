import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/',                     // home
    '/dashboard(.*)',        // dashboard and nested routes
    '/api/(.*)',             // API routes
    '/((?!_next|favicon.ico).*)', // everything else except Next.js internals
  ],
};
