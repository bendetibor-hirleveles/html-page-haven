import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { CookieConsent } from "@/components/CookieConsent";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

const POSTS_PER_PAGE = 6;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch total count
      const { count } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true })
        .eq("published", true);

      setTotalPosts(count || 0);

      // Fetch posts for current page
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractExcerpt = (htmlContent: string, maxLength = 150) => {
    const textContent = htmlContent.replace(/<[^>]*>/g, "");
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "..." 
      : textContent;
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Blogposztok betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground">
              Legfrissebb cikkeink és híreink
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Még nincsenek publikált blogposztok</h2>
              <p className="text-muted-foreground">Kérjük, nézzen vissza később!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        <Link 
                          to={`/${post.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.created_at)}
                        </div>
                        {post.updated_at !== post.created_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Frissítve: {formatDate(post.updated_at)}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {extractExcerpt(post.html_content)}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Blogposzt</Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/${post.slug}`}>
                            Tovább olvasás
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Előző
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[40px]"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Következő
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Posts count info */}
              <div className="text-center mt-6 text-sm text-muted-foreground">
                {totalPosts} blogposzt összesen
                {totalPages > 1 && (
                  <span className="ml-2">
                    (Oldal {currentPage} / {totalPages})
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <CookieConsent />
    </>
  );
}