import { Outlet } from "react-router-dom";
import { Toaster } from "./ui/sonner";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <Toaster position="top-right" />
    </div>
  );
}

