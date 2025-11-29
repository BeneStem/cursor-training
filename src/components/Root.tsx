import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/sonner";

export function Root() {
  return (
    <div className="min-h-screen bg-arcade-black arcade-grid relative">
      {/* Subtle CRT scanline overlay */}
      <div className="crt-overlay opacity-30" />
      
      {/* Main content */}
      <div className="relative z-10">
        <Outlet />
      </div>
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--arcade-dark)',
            border: '1px solid var(--arcade-cyan)',
            color: 'var(--foreground)',
            fontFamily: 'VT323, monospace',
            fontSize: '1.125rem',
          },
        }}
      />
    </div>
  );
}
