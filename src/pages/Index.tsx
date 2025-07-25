import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, FileText, BookOpen, Loader } from "lucide-react";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  is_homepage: boolean;
}

const Index = () => {
  const [homePage, setHomePage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomePage = async () => {
      try {
        const { data } = await supabase
          .from("static_pages")
          .select("id, title, slug, is_homepage")
          .eq("is_homepage", true)
          .maybeSingle();

        if (data) {
          // Use React Router navigation instead of window.location.href
          navigate(`/${data.slug}`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching homepage:", error);
        setLoading(false);
      }
    };

    fetchHomePage();
  }, [navigate]);


  // Loading state while checking for homepage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Betöltés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Üdvözöljük az oldalon</CardTitle>
          <CardDescription>
            Kezelje statikus oldalait és blog bejegyzéseit az admin panelről
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Statikus oldalak</span>
            <span>•</span>
            <BookOpen className="h-4 w-4" />
            <span>Blog bejegyzések</span>
          </div>
          
          <Button asChild className="w-full">
            <Link to="/auth">
              <Settings className="h-4 w-4 mr-2" />
              Admin bejelentkezés
            </Link>
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Még nincs kezdőoldal beállítva. Töltsön fel egy statikus oldalt és jelölje meg kezdőoldalként.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
