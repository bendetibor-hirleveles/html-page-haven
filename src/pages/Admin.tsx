import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaticPageUpload } from "@/components/admin/StaticPageUpload";
import { BlogPostUpload } from "@/components/admin/BlogPostUpload";
import { ContentList } from "@/components/admin/ContentList";
import { FileText, BookOpen, Upload } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("static-pages");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your static pages and blog posts</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="static-pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Static Pages
            </TabsTrigger>
            <TabsTrigger value="blog-posts" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blog Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="static-pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Static Page
                </CardTitle>
                <CardDescription>
                  Upload HTML files and optional assets (CSS, images, etc.) in a ZIP file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaticPageUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Static Pages</CardTitle>
                <CardDescription>Manage your uploaded static pages</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentList type="static" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blog-posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Blog Post
                </CardTitle>
                <CardDescription>
                  Upload HTML files and optional assets (CSS, images, etc.) in a ZIP file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlogPostUpload />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Blog Posts</CardTitle>
                <CardDescription>Manage your uploaded blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <ContentList type="blog" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}