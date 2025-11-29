import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getCurrentUser, signOut } from "../utils/auth";
import { getTickets, type Ticket, subscribeToTickets } from "../utils/tickets";
import { LifeBuoy, Plus, LogOut, Clock, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for tickets
    const subscription = subscribeToTickets(user.id, (updatedTicket) => {
      setTickets((prevTickets) => {
        const index = prevTickets.findIndex(t => t.id === updatedTicket.id);
        if (index >= 0) {
          // Update existing ticket
          const newTickets = [...prevTickets];
          newTickets[index] = updatedTicket;
          return newTickets;
        } else {
          // Add new ticket
          return [updatedTicket, ...prevTickets];
        }
      });

      // Show notification if AI response is ready
      if (updatedTicket.ai_response && updatedTicket.status === 'pending') {
        toast.success("AI Response Ready!", {
          description: `Your ticket "${updatedTicket.title}" has received an AI response.`,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    await loadTickets();
  };

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const allTickets = await getTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error("Error loading tickets:", error);
      toast.error("Failed to load tickets", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadTickets();
    toast.success("Tickets refreshed");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <LifeBuoy className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl text-gray-900">SupportFlow</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user.name || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl text-gray-900">Support Dashboard</h2>
            <p className="text-gray-600 mt-1">Manage your support tickets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate("/tickets/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{openTickets}</div>
              <p className="text-xs text-gray-600 mt-1">Awaiting AI response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{pendingTickets}</div>
              <p className="text-xs text-gray-600 mt-1">AI response received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{resolvedTickets}</div>
              <p className="text-xs text-gray-600 mt-1">Successfully closed</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>
              Your support tickets and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <LifeBuoy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No tickets yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first support ticket to get started
                </p>
                <Button onClick={() => navigate("/tickets/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="block"
                  >
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-gray-900">{ticket.title}</h3>
                        <Badge
                          variant={
                            ticket.status === 'open'
                              ? 'secondary'
                              : ticket.status === 'pending'
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          {new Date(ticket.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {ticket.ai_response && (
                          <span className="text-blue-600">✓ AI Response Available</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

