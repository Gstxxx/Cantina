import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`max-w-screen-xl mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}
