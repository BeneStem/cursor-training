import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { getCurrentUser } from "../utils/auth";
import { getTicketById, updateTicket, type Ticket, subscribeToTickets } from "../utils/tickets";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export function TicketDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!user || !id) return;

    // Set up real-time subscription for this specific ticket
    const subscription = subscribeToTickets(user.id, (updatedTicket) => {
      if (updatedTicket.id === id) {
        const hadAiResponse = ticket?.ai_response;
        setTicket(updatedTicket);
        
        // Show notification when AI response arrives
        if (updatedTicket.ai_response && !hadAiResponse) {
          toast.success("AI Response Ready!", {
            description: "Your ticket has received an AI-generated response.",
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, id]);

  useEffect(() => {
    if (!user || !id) return;
    loadTicket();
  }, [user, id]);

  // Poll for AI response if not ready
  useEffect(() => {
    if (ticket && !ticket.ai_response && ticket.status === 'open') {
      pollingIntervalRef.current = setInterval(() => {
        loadTicket();
      }, 2000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [ticket?.id, ticket?.ai_response, ticket?.status]);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
  };

  const loadTicket = async () => {
    if (!id) {
      navigate("/dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const foundTicket = await getTicketById(id);
      if (!foundTicket) {
        navigate("/dashboard");
        return;
      }
      setTicket(foundTicket);
    } catch (error) {
      console.error("Error loading ticket:", error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (ticket) {
      try {
        const updatedTicket = await updateTicket(ticket.id, { status: 'resolved' });
        setTicket(updatedTicket);
        toast.success("Ticket Resolved", {
          description: "Your ticket has been marked as resolved.",
        });
      } catch (error) {
        console.error("Error updating ticket:", error);
        toast.error("Failed to update ticket", {
          description: "Please try again later.",
        });
      }
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="arcade-spinner mx-auto mb-4"></div>
          <p className="text-arcade-cyan font-retro text-xl">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const StatusIcon = 
    ticket.status === 'open' ? AlertCircle :
    ticket.status === 'pending' ? Clock :
    CheckCircle;

  const statusConfig = {
    open: {
      color: 'text-arcade-orange',
      bgColor: 'bg-arcade-orange/20',
      borderColor: 'border-arcade-orange/50',
      glowClass: '',
    },
    pending: {
      color: 'text-arcade-cyan',
      bgColor: 'bg-arcade-cyan/20',
      borderColor: 'border-arcade-cyan/50',
      glowClass: 'shadow-glow-cyan-sm',
    },
    resolved: {
      color: 'text-arcade-green',
      bgColor: 'bg-arcade-green/20',
      borderColor: 'border-arcade-green/50',
      glowClass: 'shadow-glow-green',
    },
  };

  const config = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-arcade-dark/80 backdrop-blur-sm border-b border-arcade-cyan/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-arcade-cyan hover:text-arcade-pink hover:bg-arcade-pink/10 font-arcade text-[9px] transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            {ticket.status !== 'resolved' && ticket.ai_response && (
              <Button 
                onClick={handleResolve} 
                variant="outline" 
                size="sm"
                className="border-arcade-green/50 text-arcade-green hover:bg-arcade-green/20 hover:border-arcade-green font-arcade text-[9px] transition-all hover:shadow-glow-green"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge
                className={`font-arcade text-[8px] ${config.bgColor} ${config.color} ${config.borderColor} ${config.glowClass}`}
              >
                <StatusIcon className={`h-3 w-3 mr-1 ${config.color}`} />
                {ticket.status}
              </Badge>
              <span className="text-muted-foreground font-retro text-lg">
                Created {new Date(ticket.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h2 className="text-arcade-pink text-glow-pink mb-2">{ticket.title}</h2>
            <p className="text-muted-foreground font-retro text-lg">
              Ticket #{ticket.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Original Request Card */}
          <Card className="retro-card border-arcade-cyan/30">
            <CardHeader>
              <CardTitle className="text-arcade-cyan font-arcade text-xs">Your Request</CardTitle>
              <CardDescription className="text-muted-foreground font-retro text-lg">
                Original support ticket details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-retro text-xl whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* AI Response Card */}
          {ticket.ai_response ? (
            <Card className="retro-card border-arcade-purple/50 relative overflow-hidden">
              {/* Achievement-style glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-arcade-purple/10 via-transparent to-arcade-pink/10 pointer-events-none" />
              
              <CardHeader className="relative">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-arcade-purple/20 rounded glow-purple">
                    <Sparkles className="h-5 w-5 text-arcade-purple" />
                  </div>
                  <div>
                    <CardTitle className="text-arcade-purple font-arcade text-xs">AI-Generated Response</CardTitle>
                    <CardDescription className="text-arcade-pink font-retro text-lg">
                      Powered by OpenAI Function Calling
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="bg-arcade-dark/50 rounded-lg p-6 border border-arcade-purple/30">
                  <p className="text-foreground font-retro text-xl whitespace-pre-wrap leading-relaxed">
                    {ticket.ai_response}
                  </p>
                </div>
                
                <Separator className="my-6 bg-arcade-purple/30" />
                
                <div className="space-y-3">
                  <p className="text-muted-foreground font-retro text-lg">Was this response helpful?</p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-arcade-green/50 text-arcade-green hover:bg-arcade-green/20 hover:border-arcade-green font-arcade text-[9px] transition-all"
                    >
                      <span className="mr-2">👍</span> Yes, this helped
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-arcade-orange/50 text-arcade-orange hover:bg-arcade-orange/20 hover:border-arcade-orange font-arcade text-[9px] transition-all"
                    >
                      <span className="mr-2">👎</span> No, I need more help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="retro-card border-arcade-cyan/30">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="arcade-spinner"></div>
                    <Zap className="h-5 w-5 text-arcade-yellow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-arcade-cyan font-arcade text-xs mb-3">Generating AI Response...</h3>
                  <p className="text-muted-foreground font-retro text-xl max-w-md mx-auto">
                    Our AI is analyzing your ticket and preparing a detailed response.
                    This usually takes a few seconds.
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    <span className="w-2 h-2 bg-arcade-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-arcade-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-arcade-yellow rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-arcade-dark/50 border border-arcade-cyan/20 rounded-lg p-4">
          <h4 className="text-arcade-cyan font-arcade text-[10px] mb-3 flex items-center gap-2">
            <span className="text-lg">ℹ️</span> About AI Responses
          </h4>
          <p className="text-muted-foreground font-retro text-lg">
            Our AI uses advanced natural language processing to understand your issue
            and provide relevant solutions. In a production environment, this would be
            powered by OpenAI's GPT models with function calling capabilities to access
            your account data and perform actions on your behalf.
          </p>
        </div>
      </main>
    </div>
  );
}
