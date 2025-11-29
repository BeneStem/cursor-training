import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getCurrentUser } from "../utils/auth";
import { createTicket } from "../utils/tickets";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function NewTicketPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!title || !description) {
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      setError("You must be logged in to create a ticket");
      setIsSubmitting(false);
      return;
    }

    try {
      const ticket = await createTicket(title, description);
      toast.success("Ticket Created!", {
        description: "Your support ticket has been created. AI response will be ready shortly.",
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create ticket";
      setError(errorMessage);
      toast.error("Failed to Create Ticket", {
        description: errorMessage,
      });
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-arcade-dark/80 backdrop-blur-sm border-b border-arcade-cyan/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
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
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-arcade-pink text-glow-pink mb-2">Create New Ticket</h2>
          <p className="text-muted-foreground font-retro text-xl">
            Describe your issue and our AI will generate a response
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="retro-card border-arcade-cyan/30">
          <CardHeader>
            <CardTitle className="text-arcade-cyan font-arcade text-xs">Support Request Details</CardTitle>
            <CardDescription className="text-muted-foreground font-retro text-lg">
              Provide as much detail as possible to help us assist you better
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded text-destructive font-retro text-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-arcade-yellow font-arcade text-[10px]">
                  Ticket Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief description of your issue"
                  required
                  className="bg-arcade-mid/50 border-arcade-cyan/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-cyan focus:shadow-glow-cyan-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-arcade-yellow font-arcade text-[10px]">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed information about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                  rows={8}
                  required
                  className="bg-arcade-mid/50 border-arcade-cyan/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-cyan focus:shadow-glow-cyan-sm transition-all resize-none"
                />
              </div>

              {/* AI Info Box */}
              <div className="bg-arcade-purple/10 border border-arcade-purple/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-arcade-purple" />
                  <h4 className="text-arcade-purple font-arcade text-[10px]">
                    AI-Powered Response
                  </h4>
                </div>
                <p className="text-muted-foreground font-retro text-lg">
                  Once you submit this ticket, our AI system will analyze your issue
                  and generate an intelligent response using OpenAI function calling.
                  You'll receive the response within a few seconds.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                  className="border-arcade-cyan/50 text-arcade-cyan hover:bg-arcade-cyan/20 hover:border-arcade-cyan font-arcade text-[9px] transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-arcade-pink hover:bg-arcade-pink/80 text-white font-arcade text-[9px] hover:shadow-glow-pink transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <div className="mt-6 bg-arcade-dark/50 border border-arcade-yellow/20 rounded-lg p-4">
          <h4 className="text-arcade-yellow font-arcade text-[10px] mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span> Tips for better support
          </h4>
          <ul className="text-muted-foreground font-retro text-lg space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-arcade-cyan">▸</span>
              Be specific about what you're trying to accomplish
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-pink">▸</span>
              Include any error messages you've received
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-green">▸</span>
              Mention what you've already tried to resolve the issue
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arcade-purple">▸</span>
              Provide your browser and device information if relevant
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
