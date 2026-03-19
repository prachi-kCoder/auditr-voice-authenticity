import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    setMobileOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Security", id: "security" },
    { label: "Pricing", id: "pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-8 h-8 text-primary group-hover:animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Auditr
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-foreground/80 hover:text-primary transition-colors bg-transparent border-none cursor-pointer text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
            <Link to="/api-docs" className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium">
              API
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth/login")} className="hidden sm:inline-flex">
                  Sign In
                </Button>
                <Button variant="default" onClick={() => navigate("/auth/signup")}>
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left text-foreground/80 hover:text-primary transition-colors py-2 bg-transparent border-none cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/api-docs"
              className="block text-foreground/80 hover:text-primary transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              API
            </Link>
            {!user && (
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate("/auth/login"); setMobileOpen(false); }}>
                Sign In
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
