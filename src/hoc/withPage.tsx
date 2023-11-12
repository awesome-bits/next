import React from 'react';
import { AuthChecker } from '@/wrappers';

interface WithPageOptions {
  mode: string;
  fallback?: string | { 
    [key: string]: string 
  }
}

export function withPage(Component: React.ComponentType, options?: WithPageOptions) {
  return function Page(props: any) {
    return (
      <AuthChecker options={options}>
        <Component {...props} />
      </AuthChecker>
    )
  };
}
