import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Home, Gamepad2 } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        {/* Arcade-style 404 */}
        <div className="relative inline-block mb-6">
          <h1 className="text-7xl font-arcade text-arcade-pink text-glow-pink">404</h1>
          {/* Decorative elements */}
          <div className="absolute -top-2 -left-4 w-3 h-3 bg-arcade-cyan animate-pulse" />
          <div className="absolute -top-2 -right-4 w-3 h-3 bg-arcade-yellow animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -bottom-2 -left-4 w-3 h-3 bg-arcade-green animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-2 -right-4 w-3 h-3 bg-arcade-purple animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="mb-6">
          <Gamepad2 className="h-12 w-12 text-arcade-cyan mx-auto mb-4 animate-bounce" />
        </div>
        
        <h2 className="text-arcade-cyan font-arcade text-sm mb-3">Game Over</h2>
        <p className="text-muted-foreground font-retro text-xl mb-8 max-w-md mx-auto">
          The page you're looking for has escaped to another dimension.
          Insert coin to continue...
        </p>
        
        <Link to="/dashboard">
          <Button className="bg-arcade-pink hover:bg-arcade-pink/80 text-white font-arcade text-[10px] hover:shadow-glow-pink transition-all">
            <Home className="h-4 w-4 mr-2" />
            Return to Base
          </Button>
        </Link>
        
        {/* High score style decoration */}
        <div className="mt-12 text-muted-foreground font-retro text-lg">
          <p className="text-arcade-yellow">HIGH SCORE: 999,999</p>
          <p className="text-arcade-cyan mt-1">YOUR SCORE: 0</p>
        </div>
      </div>
    </div>
  );
}
