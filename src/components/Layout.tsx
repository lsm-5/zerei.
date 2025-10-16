import React, { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/40">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;