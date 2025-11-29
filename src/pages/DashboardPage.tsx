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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="arcade-spinner mx-auto mb-4"></div>
          <p className="text-arcade-cyan font-retro text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="min-h-screen">
      {/* Arcade Header */}
      <header className="bg-arcade-dark/80 backdrop-blur-sm border-b border-arcade-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-arcade-pink p-2 rounded glow-pink">
                  <LifeBuoy className="h-6 w-6 text-white" />
                </div>
                {/* Pixel corners */}
                <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-arcade-cyan" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-arcade-cyan" />
                <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-arcade-cyan" />
                <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-arcade-cyan" />
              </div>
              <div>
                <h1 className="text-arcade-pink text-glow-pink text-sm">SupportFlow</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-arcade-yellow font-retro text-lg">
                {user.name || user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-arcade-pink/50 text-arcade-pink hover:bg-arcade-pink/20 hover:border-arcade-pink font-arcade text-[9px] transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-arcade-cyan text-glow-cyan mb-2">Support Dashboard</h2>
            <p className="text-muted-foreground font-retro text-xl">Manage your support tickets</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="border-arcade-cyan/50 text-arcade-cyan hover:bg-arcade-cyan/20 hover:border-arcade-cyan font-arcade text-[9px] transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => navigate("/tickets/new")}
              className="bg-arcade-pink hover:bg-arcade-pink/80 text-white font-arcade text-[9px] hover:shadow-glow-pink transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Open Tickets */}
          <Card className="retro-card border-arcade-orange/30 hover:border-arcade-orange/60 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-arcade-orange font-arcade text-[10px]">Open Tickets</CardTitle>
              <div className="p-2 bg-arcade-orange/20 rounded group-hover:shadow-glow-pink-sm transition-all">
                <AlertCircle className="h-4 w-4 text-arcade-orange" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-arcade text-arcade-orange text-glow-yellow">{openTickets}</div>
              <p className="text-muted-foreground font-retro text-lg mt-2">Awaiting AI response</p>
            </CardContent>
          </Card>

          {/* Pending Tickets */}
          <Card className="retro-card border-arcade-cyan/30 hover:border-arcade-cyan/60 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-arcade-cyan font-arcade text-[10px]">Pending</CardTitle>
              <div className="p-2 bg-arcade-cyan/20 rounded group-hover:shadow-glow-cyan-sm transition-all">
                <Clock className="h-4 w-4 text-arcade-cyan" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-arcade text-arcade-cyan text-glow-cyan">{pendingTickets}</div>
              <p className="text-muted-foreground font-retro text-lg mt-2">AI response received</p>
            </CardContent>
          </Card>

          {/* Resolved Tickets */}
          <Card className="retro-card border-arcade-green/30 hover:border-arcade-green/60 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-arcade-green font-arcade text-[10px]">Resolved</CardTitle>
              <div className="p-2 bg-arcade-green/20 rounded group-hover:shadow-glow-green transition-all">
                <CheckCircle className="h-4 w-4 text-arcade-green" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-arcade text-arcade-green text-glow-green">{resolvedTickets}</div>
              <p className="text-muted-foreground font-retro text-lg mt-2">Successfully closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="retro-card border-arcade-purple/30">
          <CardHeader>
            <CardTitle className="text-arcade-purple font-arcade text-xs">Recent Tickets</CardTitle>
            <CardDescription className="text-muted-foreground font-retro text-lg">
              Your support tickets and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="arcade-spinner mx-auto mb-4"></div>
                <p className="text-arcade-cyan font-retro text-xl">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative inline-block mb-4">
                  <LifeBuoy className="h-12 w-12 text-arcade-pink" />
                  <div className="absolute inset-0 animate-ping">
                    <LifeBuoy className="h-12 w-12 text-arcade-pink/30" />
                  </div>
                </div>
                <h3 className="text-arcade-yellow font-arcade text-xs mb-3">No tickets yet</h3>
                <p className="text-muted-foreground font-retro text-xl mb-6">
                  Create your first support ticket to get started
                </p>
                <Button 
                  onClick={() => navigate("/tickets/new")}
                  className="bg-arcade-cyan hover:bg-arcade-cyan/80 text-arcade-black font-arcade text-[9px] hover:shadow-glow-cyan transition-all"
                >
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
                    <div className="border border-arcade-cyan/20 rounded bg-arcade-mid/30 p-4 hover:border-arcade-pink/60 hover:shadow-glow-pink-sm transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-foreground font-retro text-xl group-hover:text-arcade-pink transition-colors">
                          {ticket.title}
                        </h3>
                        <Badge
                          className={`font-arcade text-[8px] ${
                            ticket.status === 'open'
                              ? 'bg-arcade-orange/20 text-arcade-orange border-arcade-orange/50'
                              : ticket.status === 'pending'
                              ? 'bg-arcade-cyan/20 text-arcade-cyan border-arcade-cyan/50'
                              : 'bg-arcade-green/20 text-arcade-green border-arcade-green/50'
                          }`}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-retro text-lg mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-retro">
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
                          <span className="text-arcade-green flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-arcade-green rounded-full animate-pulse" />
                            AI Response Available
                          </span>
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
