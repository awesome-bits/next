"use client";

interface AuthCheckerProps {
  children: React.ReactNode;
  options?: {
    mode: string;
    fallback?: string | { 
      [key: string]: string 
    }
  }
}

export function AuthChecker({ children, options }: AuthCheckerProps) {

  if(!options) return <>{children}</>;

  const { mode, fallback } = options;

  return <>{children}</>
}