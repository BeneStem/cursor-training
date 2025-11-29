import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getCurrentUser } from "../utils/auth";
import { createTicket } from "../utils/tickets";
import { ArrowLeft, Send } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl text-gray-900">Create New Ticket</h2>
          <p className="text-gray-600 mt-1">
            Describe your issue and our AI will generate a response
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Support Request Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible to help us assist you better
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Ticket Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed information about your issue, including any error messages, steps to reproduce, and what you've already tried..."
                  rows={8}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm text-blue-900 mb-2">
                  🤖 AI-Powered Response
                </h4>
                <p className="text-sm text-blue-800">
                  Once you submit this ticket, our AI system will analyze your issue
                  and generate an intelligent response using OpenAI function calling.
                  You'll receive the response within a few seconds.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Submitting...</>
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

        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm text-gray-900 mb-2">💡 Tips for better support</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Be specific about what you're trying to accomplish</li>
            <li>• Include any error messages you've received</li>
            <li>• Mention what you've already tried to resolve the issue</li>
            <li>• Provide your browser and device information if relevant</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

