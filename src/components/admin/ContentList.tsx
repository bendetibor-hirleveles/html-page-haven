import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Trash2, Edit3, Eye, EyeOff, Home, Menu, Navigation, Search, Tag, Sparkles, Save } from "lucide-react";
import { format } from "date-fns";

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  html_file_path: string;
  html_content: string;
  assets_zip_path: string | null;
  is_homepage: boolean;
  show_in_menu: boolean;
  show_in_header: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  html_file_path: string;
  html_content: string;
  assets_zip_path: string | null;
  published: boolean;
  show_in_menu?: boolean;
  show_in_header?: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface ContentListProps {
  type: 'static' | 'blog';
}

export function ContentList({ type }: ContentListProps) {
  const [items, setItems] = useState<(StaticPage | BlogPost)[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<(StaticPage | BlogPost) | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const toggleMenuVisibility = async (id: string, field: 'show_in_menu' | 'show_in_header', currentStatus: boolean) => {
    try {
      const table = type === 'static' ? 'static_pages' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .update({ [field]: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      const fieldName = field === 'show_in_menu' ? 'menüben' : 'fejléc menüben';
      toast({
        title: "Sikeres módosítás",
        description: `${type === 'static' ? 'Oldal' : 'Poszt'} ${!currentStatus ? 'megjelenik' : 'elrejtve'} a ${fieldName}`,
      });

      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Hiba",
        description: `Nem sikerült frissíteni a ${type === 'static' ? 'oldalt' : 'posztot'}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: StaticPage | BlogPost) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditSlug(item.slug);
    setIsEditDialogOpen(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    try {
      const table = type === 'static' ? 'static_pages' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .update({ 
          title: editTitle.trim(),
          slug: editSlug.trim()
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({
        title: "Sikeres módosítás",
        description: "Az oldal adatai sikeresen frissítve",
      });

      setIsEditDialogOpen(false);
      setEditingItem(null);
      setEditTitle("");
      setEditSlug("");
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült frissíteni az oldal adatait",
        variant: "destructive",
      });
    }
  };

  const generateSEO = async (pageId: string, pageType: string, htmlContent: string, title: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-seo', {
        body: {
          pageId,
          pageType,
          htmlContent,
          currentTitle: title
        }
      });

      if (error) throw error;

      toast({
        title: "SEO generálva!",
        description: "Az automatikus SEO beállítások sikeresen elkészültek",
      });
    } catch (error) {
      console.error('Error generating SEO:', error);
      toast({
        title: "Hiba",
        description: "Nem sikerült generálni a SEO beállításokat",
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
                {type === 'blog' && (item as BlogPost).tags && (item as BlogPost).tags!.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(item as BlogPost).tags!.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {type === 'blog' && (
                  <Badge variant={(item as BlogPost).published ? 'default' : 'secondary'}>
                    {(item as BlogPost).published ? 'Published' : 'Draft'}
                  </Badge>
                )}
                {type === 'static' && (item as StaticPage).is_homepage && (
                  <Badge variant="default" className="bg-primary">
                    Kezdőoldal
                  </Badge>
                )}
                {((type === 'static' && (item as StaticPage).show_in_menu) || 
                  (type === 'blog' && (item as BlogPost).show_in_menu)) && (
                  <Badge variant="outline">
                    <Menu className="h-3 w-3 mr-1" />
                    Menü
                  </Badge>
                )}
                {((type === 'static' && (item as StaticPage).show_in_header) || 
                  (type === 'blog' && (item as BlogPost).show_in_header)) && (
                  <Badge variant="outline">
                    <Navigation className="h-3 w-3 mr-1" />
                    Fejléc
                  </Badge>
                )}
                {item.assets_zip_path && (
                  <Badge variant="outline">Van asset</Badge>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Szerkesztés
                </Button>

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
                    {(item as StaticPage).is_homepage ? 'Nem kezdőoldal' : 'Kezdőoldal'}
                  </Button>
                )}
                
                <Button
                  variant={type === 'static' 
                    ? ((item as StaticPage).show_in_menu ? "default" : "outline")
                    : ((item as BlogPost).show_in_menu ? "default" : "outline")
                  }
                  size="sm"
                  onClick={() => toggleMenuVisibility(
                    item.id, 
                    'show_in_menu', 
                    type === 'static' 
                      ? (item as StaticPage).show_in_menu 
                      : (item as BlogPost).show_in_menu || false
                  )}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Menü
                </Button>
                
                <Button
                  variant={type === 'static' 
                    ? ((item as StaticPage).show_in_header ? "default" : "outline")
                    : ((item as BlogPost).show_in_header ? "default" : "outline")
                  }
                  size="sm"
                  onClick={() => toggleMenuVisibility(
                    item.id, 
                    'show_in_header', 
                    type === 'static' 
                      ? (item as StaticPage).show_in_header 
                      : (item as BlogPost).show_in_header || false
                  )}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Fejléc
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/admin?tab=page-seo&pageId=${item.id}&pageType=${type}`, '_blank')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  SEO
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateSEO(item.id, type, item.html_content || '', item.title)}
                  className="bg-green-50 hover:bg-green-100"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Auto SEO
                </Button>
                
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Oldal szerkesztése</DialogTitle>
            <DialogDescription>
              Módosíthatod az oldal címét és slug-ját (URL-jét).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Cím
              </Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="col-span-3"
                placeholder="Oldal címe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                className="col-span-3"
                placeholder="url-slug"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Mégse
            </Button>
            <Button onClick={saveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}