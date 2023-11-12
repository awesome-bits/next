import React from "react";

const authContext = React.createContext(undefined)

export const AuthWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <>{children}</>
  )
}