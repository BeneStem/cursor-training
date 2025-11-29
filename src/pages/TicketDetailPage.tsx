import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { getCurrentUser } from "../utils/auth";
import { getTicketById, updateTicket, type Ticket, subscribeToTickets } from "../utils/tickets";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const StatusIcon = 
    ticket.status === 'open' ? AlertCircle :
    ticket.status === 'pending' ? Clock :
    CheckCircle;

  const statusColor = 
    ticket.status === 'open' ? 'text-orange-600' :
    ticket.status === 'pending' ? 'text-blue-600' :
    'text-green-600';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            {ticket.status !== 'resolved' && ticket.ai_response && (
              <Button onClick={handleResolve} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant={
                  ticket.status === 'open'
                    ? 'secondary'
                    : ticket.status === 'pending'
                    ? 'default'
                    : 'outline'
                }
              >
                <StatusIcon className={`h-3 w-3 mr-1 ${statusColor}`} />
                {ticket.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Created {new Date(ticket.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <h2 className="text-3xl text-gray-900 mb-2">{ticket.title}</h2>
            <p className="text-gray-600">Ticket #{ticket.id}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Request</CardTitle>
              <CardDescription>Original support ticket details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {ticket.ai_response ? (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-blue-900">AI-Generated Response</CardTitle>
                </div>
                <CardDescription className="text-blue-800">
                  Powered by OpenAI Function Calling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-6 border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.ai_response}
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Was this response helpful?</p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      👍 Yes, this helped
                    </Button>
                    <Button variant="outline" size="sm">
                      👎 No, I need more help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-gray-900 mb-2">Generating AI Response...</h3>
                  <p className="text-gray-600">
                    Our AI is analyzing your ticket and preparing a detailed response.
                    This usually takes a few seconds.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm text-gray-900 mb-2">ℹ️ About AI Responses</h4>
          <p className="text-sm text-gray-700">
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

