import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { signIn, signUp } from "../utils/auth";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      toast.success("Welcome back!", {
        description: "You have been successfully logged in.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in";
      setError(errorMessage);
      toast.error("Login Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, name);
      toast.success("Account Created!", {
        description: "Welcome to SupportFlow! Your account has been created.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create account";
      setError(errorMessage);
      toast.error("Sign Up Failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Arcade-style Logo */}
        <div className="flex flex-col items-center justify-center gap-4 mb-10">
          <div className="relative">
            <div className="bg-arcade-pink p-4 rounded-lg glow-pink">
              <LifeBuoy className="h-10 w-10 text-white" />
            </div>
            {/* Decorative pixel corners */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-arcade-cyan" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-arcade-cyan" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-arcade-cyan" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-arcade-cyan" />
          </div>
          <div className="text-center">
            <h1 className="text-arcade-pink text-glow-pink mb-2">SupportFlow</h1>
            <p className="text-arcade-cyan font-retro text-xl tracking-wider">
              AI-Powered Support Tickets
            </p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-arcade-dark border border-arcade-cyan/30 p-1">
            <TabsTrigger 
              value="login" 
              className="font-arcade text-[10px] data-[state=active]:bg-arcade-pink data-[state=active]:text-white data-[state=active]:shadow-glow-pink-sm text-arcade-cyan transition-all"
            >
              Login
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="font-arcade text-[10px] data-[state=active]:bg-arcade-cyan data-[state=active]:text-arcade-black data-[state=active]:shadow-glow-cyan-sm text-arcade-pink transition-all"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="retro-card border-arcade-cyan/30 mt-4">
              <CardHeader>
                <CardTitle className="text-arcade-cyan text-sm">Welcome back</CardTitle>
                <CardDescription className="text-muted-foreground font-retro text-lg">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded text-sm text-destructive font-retro text-lg">
                    {error}
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-arcade-yellow font-arcade text-[10px]">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="bg-arcade-mid/50 border-arcade-cyan/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-cyan focus:shadow-glow-cyan-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-arcade-yellow font-arcade text-[10px]">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-arcade-mid/50 border-arcade-cyan/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-cyan focus:shadow-glow-cyan-sm transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-arcade-pink hover:bg-arcade-pink/80 text-white font-arcade text-[10px] h-12 hover:shadow-glow-pink transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Press Start"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="retro-card border-arcade-pink/30 mt-4">
              <CardHeader>
                <CardTitle className="text-arcade-pink text-sm">Create an account</CardTitle>
                <CardDescription className="text-muted-foreground font-retro text-lg">
                  Enter your information to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 rounded text-sm text-destructive font-retro text-lg">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-arcade-yellow font-arcade text-[10px]">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Player One"
                      required
                      className="bg-arcade-mid/50 border-arcade-pink/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-pink focus:shadow-glow-pink-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-arcade-yellow font-arcade text-[10px]">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="bg-arcade-mid/50 border-arcade-pink/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-pink focus:shadow-glow-pink-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-arcade-yellow font-arcade text-[10px]">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="bg-arcade-mid/50 border-arcade-pink/30 text-foreground font-retro text-xl placeholder:text-muted-foreground/50 focus:border-arcade-pink focus:shadow-glow-pink-sm transition-all"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-arcade-cyan hover:bg-arcade-cyan/80 text-arcade-black font-arcade text-[10px] h-12 hover:shadow-glow-cyan transition-all" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Insert Coin"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-muted-foreground mt-6 font-retro text-lg">
          <span className="text-arcade-purple">⚡</span> Powered by Supabase <span className="text-arcade-purple">⚡</span>
        </p>
      </div>
    </div>
  );
}
