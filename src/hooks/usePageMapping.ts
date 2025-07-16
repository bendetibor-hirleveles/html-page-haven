import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageMappingHook {
  pageMapping: Map<string, string> | null;
  loading: boolean;
  error: string | null;
}

export const usePageMapping = (): PageMappingHook => {
  const [pageMapping, setPageMapping] = useState<Map<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPageMapping = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check localStorage cache first
      const cached = localStorage.getItem('pageMapping');
      const cacheTime = localStorage.getItem('pageMappingTime');
      
      if (cached && cacheTime) {
        const isExpired = Date.now() - parseInt(cacheTime) > 5 * 60 * 1000; // 5 minutes
        if (!isExpired) {
        const cachedData: [string, string][] = JSON.parse(cached);
        const mapping = new Map<string, string>(cachedData);
          setPageMapping(mapping);
          setLoading(false);
          return;
        }
      }

      // Fetch from database
      const [staticPagesResult, blogPostsResult] = await Promise.all([
        supabase.from("static_pages").select("slug, title"),
        supabase.from("blog_posts").select("slug, title").eq("published", true)
      ]);

      const mapping = new Map<string, string>();
      
      if (staticPagesResult.data) {
        staticPagesResult.data.forEach(page => {
          mapping.set(page.title.toLowerCase(), page.slug);
          mapping.set(page.slug, page.slug);
        });
      }
      
      if (blogPostsResult.data) {
        blogPostsResult.data.forEach(post => {
          mapping.set(post.title.toLowerCase(), post.slug);
          mapping.set(post.slug, post.slug);
        });
      }

      // Cache the results
      localStorage.setItem('pageMapping', JSON.stringify(Array.from(mapping.entries())));
      localStorage.setItem('pageMappingTime', Date.now().toString());
      
      setPageMapping(mapping);
    } catch (err) {
      setError("Failed to load page mapping");
      console.error("Error fetching page mapping:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageMapping();
  }, []);

  return { pageMapping, loading, error };
};