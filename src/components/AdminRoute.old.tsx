import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Loader, Shield } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Check user profile and admin role
  const checkUserRole = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check admin role when user signs in
        if (session?.user) {
          checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check admin role for existing session
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>{loading ? 'Hitelesítés ellenőrzése...' : 'Szerepkör ellenőrzése...'}</span>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <Shield className="h-16 w-16 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Hozzáférés megtagadva</h1>
            <p className="text-muted-foreground mb-4">
              Nincs jogosultságod az admin felület eléréséhez.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Vissza a főoldalra
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
