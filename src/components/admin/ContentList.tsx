import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Trash2, Edit3, Eye, EyeOff, Home } from "lucide-react";
import { format } from "date-fns";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  html_file_path: string;
  assets_zip_path: string | null;
  is_homepage: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  html_file_path: string;
  assets_zip_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface ContentListProps {
  type: 'static' | 'blog';
}

export function ContentList({ type }: ContentListProps) {
  const [items, setItems] = useState<(StaticPage | BlogPost)[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const table = type === 'static' ? 'static_pages' : 'blog_posts';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const table = type === 'static' ? 'static_pages' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    if (type !== 'blog') return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });

      fetchItems();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const toggleHomepage = async (id: string, currentStatus: boolean) => {
    if (type !== 'static') return;

    try {
      const { error } = await supabase
        .from('static_pages')
        .update({ is_homepage: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Page ${!currentStatus ? 'set as homepage' : 'removed as homepage'} successfully`,
      });

      fetchItems();
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Error",
        description: "Failed to update page",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type === 'static' ? 'static pages' : 'blog posts'} found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Slug: /{item.slug}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Created: {format(new Date(item.created_at), 'PPp')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {type === 'blog' && (
                  <Badge variant={(item as BlogPost).published ? 'default' : 'secondary'}>
                    {(item as BlogPost).published ? 'Published' : 'Draft'}
                  </Badge>
                )}
                {type === 'static' && (item as StaticPage).is_homepage && (
                  <Badge variant="default" className="bg-primary">
                    Homepage
                  </Badge>
                )}
                {item.assets_zip_path && (
                  <Badge variant="outline">Has Assets</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a
                    href={getFileUrl(type === 'static' ? 'static-pages' : 'blog-posts', item.html_file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View HTML
                  </a>
                </Button>
                
                {item.assets_zip_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={getFileUrl('assets', item.assets_zip_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Download Assets
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                {type === 'blog' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublished(item.id, (item as BlogPost).published)}
                  >
                    {(item as BlogPost).published ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Publish
                      </>
                    )}
                  </Button>
                )}
                
                {type === 'static' && (
                  <Button
                    variant={(item as StaticPage).is_homepage ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHomepage(item.id, (item as StaticPage).is_homepage)}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {(item as StaticPage).is_homepage ? 'Remove Homepage' : 'Set as Homepage'}
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}