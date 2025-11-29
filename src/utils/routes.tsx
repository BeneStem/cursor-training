import { createBrowserRouter, Navigate } from "react-router-dom";
import { Root } from "../components/Root";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { NewTicketPage } from "../pages/NewTicketPage";
import { TicketDetailPage } from "../pages/TicketDetailPage";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", Component: LoginPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "tickets/new", Component: NewTicketPage },
      { path: "tickets/:id", Component: TicketDetailPage },
      { path: "*", Component: NotFound },
    ],
  },
]);

