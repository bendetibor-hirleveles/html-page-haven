import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, TrendingUp, Target, BarChart3, AlertCircle } from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  trend_data: any;
}

interface PageKeyword {
  id: string;
  page_type: string;
  page_id: string;
  keyword_id: string;
  position: number;
  density: number;
  keyword: Keyword;
}

export function KeywordAnalysis() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [pageKeywords, setPageKeywords] = useState<PageKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKeywords();
    fetchPageKeywords();
  }, []);

  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeywords(data || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      toast({
        title: "Error",
        description: "Failed to load keywords",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPageKeywords = async () => {
    try {
      const { data, error } = await supabase
        .from('page_keywords')
        .select(`
          *,
          keyword:keywords(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPageKeywords(data || []);
    } catch (error) {
      console.error('Error fetching page keywords:', error);
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;

    try {
      const { error } = await supabase
        .from('keywords')
        .insert({
          keyword: newKeyword.trim(),
          search_volume: 0,
          difficulty: 0,
          cpc: 0,
        });

      if (error) throw error;

      setNewKeyword("");
      await fetchKeywords();
      toast({
        title: "Success!",
        description: "Keyword added successfully",
      });
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast({
        title: "Error",
        description: "Failed to add keyword",
        variant: "destructive",
      });
    }
  };

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    try {
      // Fetch all static pages and blog posts
      const [staticPages, blogPosts] = await Promise.all([
        supabase.from('static_pages').select('*'),
        supabase.from('blog_posts').select('*')
      ]);

      const allContent = [
        ...(staticPages.data || []).map(page => ({
          id: page.id,
          type: 'static',
          title: page.title,
          content: page.html_content,
          slug: page.slug
        })),
        ...(blogPosts.data || []).map(post => ({
          id: post.id,
          type: 'blog',
          title: post.title,
          content: post.html_content,
          slug: post.slug
        }))
      ];

      // Simple keyword analysis
      const analysis = allContent.map(item => {
        const text = item.content.toLowerCase();
        const words = text.match(/\b\w+\b/g) || [];
        const wordCount = words.length;
        
        // Calculate keyword density for tracked keywords
        const keywordAnalysis = keywords.map(keyword => {
          const keywordRegex = new RegExp(`\\b${keyword.keyword.toLowerCase()}\\b`, 'g');
          const matches = text.match(keywordRegex) || [];
          const density = wordCount > 0 ? (matches.length / wordCount) * 100 : 0;
          
          return {
            keyword: keyword.keyword,
            count: matches.length,
            density: density.toFixed(2)
          };
        });

        return {
          ...item,
          wordCount,
          keywordAnalysis: keywordAnalysis.filter(k => k.count > 0)
        };
      });

      setAnalysisResults(analysis);
      toast({
        title: "Analysis Complete!",
        description: "Content analysis has been completed",
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast({
        title: "Error",
        description: "Failed to analyze content",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return "bg-green-500";
    if (difficulty < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return "Easy";
    if (difficulty < 60) return "Medium";
    return "Hard";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Keyword Analysis & Management</h2>
        <Button onClick={analyzeContent} disabled={isAnalyzing}>
          <BarChart3 className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Analyzing..." : "Analyze Content"}
        </Button>
      </div>

      <Tabs defaultValue="keywords" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="rankings" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Rankings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter keyword to track"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword
                </Button>
              </div>

              <div className="space-y-2">
                {keywords.map((keyword) => (
                  <div key={keyword.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{keyword.keyword}</span>
                      <Badge variant="secondary">
                        Vol: {keyword.search_volume}
                      </Badge>
                      <Badge variant={keyword.difficulty < 30 ? "default" : keyword.difficulty < 60 ? "secondary" : "destructive"}>
                        {getDifficultyLabel(keyword.difficulty)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        CPC: ${keyword.cpc}
                      </span>
                      <div className="w-20">
                        <Progress value={keyword.difficulty} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No keywords added yet. Add your first keyword to start tracking.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <div className="space-y-4">
                  {analysisResults.map((result: any) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{result.title}</h4>
                        <Badge variant="outline">{result.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Word count: {result.wordCount} | Slug: /{result.slug}
                      </p>
                      
                      {result.keywordAnalysis.length > 0 ? (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Found Keywords:</h5>
                          {result.keywordAnalysis.map((ka: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span>{ka.keyword}</span>
                              <div className="flex items-center gap-2">
                                <span>Count: {ka.count}</span>
                                <span>Density: {ka.density}%</span>
                                <Progress value={parseFloat(ka.density)} className="w-16 h-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          No tracked keywords found in content
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Analyze Content" to see keyword analysis for your pages and posts.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rankings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageKeywords.map((pk) => (
                  <div key={pk.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{pk.keyword.keyword}</span>
                      <Badge variant="outline">{pk.page_type}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        Position: {pk.position || 'N/A'}
                      </div>
                      <div className="text-sm">
                        Density: {pk.density}%
                      </div>
                    </div>
                  </div>
                ))}
                {pageKeywords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No keyword rankings data available yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}