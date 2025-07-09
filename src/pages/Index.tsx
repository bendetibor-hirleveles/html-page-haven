import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, FileText, BookOpen } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Your Site</CardTitle>
          <CardDescription>
            Manage your static pages and blog posts from the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Static Pages</span>
            <span>•</span>
            <BookOpen className="h-4 w-4" />
            <span>Blog Posts</span>
          </div>
          
          <Button asChild className="w-full">
            <Link to="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Go to Admin Panel
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
