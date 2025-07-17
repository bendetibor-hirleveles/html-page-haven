import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CookieConsent } from "@/components/CookieConsent";
import { Loader } from "lucide-react";

interface PageContent {
  id: string;
  title: string;
  slug: string;
  html_content: string;
  assets_zip_path: string | null;
  created_at: string;
  updated_at: string;
  // Optional fields that may differ between static_pages and blog_posts
  html_file_path?: string | null;
  is_homepage?: boolean;
  show_in_menu?: boolean;
  show_in_header?: boolean;
  published?: boolean;
}

export function StaticPageViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageContent | null>(null);
  const [processedHtml, setProcessedHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if HTML contains dynamic links
  const hasDynamicLinks = useCallback((html: string) => {
    return /href=["']\{\{[^}]+\}\}["']|data-page=["'][^"']+["']/.test(html);
  }, []);

  // Fetch page mapping only when needed
  const fetchPageMapping = useCallback(async () => {
    const [staticPagesResult, blogPostsResult] = await Promise.all([
      supabase.from("static_pages").select("slug, title"),
      supabase.from("blog_posts").select("slug, title").eq("published", true)
    ]);

    const pageMapping = new Map<string, string>();
    
    // Helper function to normalize text for mapping
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[áàâäã]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòôöõ]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ö]/g, 'o')
        .replace(/[ü]/g, 'u')
        .replace(/[ő]/g, 'o')
        .replace(/[ű]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    if (staticPagesResult.data) {
      staticPagesResult.data.forEach(page => {
        // Add multiple mappings for each page
        pageMapping.set(page.title.toLowerCase(), page.slug);
        pageMapping.set(normalizeText(page.title), page.slug);
        pageMapping.set(page.slug, page.slug);
        pageMapping.set(page.slug.toLowerCase(), page.slug);
      });
    }
    
    if (blogPostsResult.data) {
      blogPostsResult.data.forEach(post => {
        // Add multiple mappings for each post
        pageMapping.set(post.title.toLowerCase(), post.slug);
        pageMapping.set(normalizeText(post.title), post.slug);
        pageMapping.set(post.slug, post.slug);
        pageMapping.set(post.slug.toLowerCase(), post.slug);
      });
    }

    // Add common old->new mappings
    const oldToNewMappings = {
      'contacts': 'contact',
      'contact': 'contact',
      'comtact': 'contact',
      'hirlevel-konzultacio': 'konzultacio',
      'konzultacio': 'konzultacio',
      'hirleveleskozultacio': 'konzultacio',
      'automat': 'automat',
      'kurzus': 'kurzus',
      'pricing': 'pricing',
      'authors': 'authors',
      'aszf': 'aszf',
      'privacy': 'privacy',
      'adatbekero': 'adatbekero'
    };

    // Apply old->new mappings
    Object.entries(oldToNewMappings).forEach(([oldName, newName]) => {
      const targetSlug = pageMapping.get(newName);
      if (targetSlug) {
        pageMapping.set(oldName, targetSlug);
        pageMapping.set(oldName.toLowerCase(), targetSlug);
        pageMapping.set(normalizeText(oldName), targetSlug);
      }
    });

    console.log('Created page mapping with entries:', Array.from(pageMapping.entries()));
    return pageMapping;
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      
      // Debug: Log what slug we're trying to fetch
      console.log('StaticPageViewer: Attempting to fetch slug:', slug);
      
      // Skip reserved routes - these should be handled by specific route components
      if (['auth', 'admin', 'blog'].includes(slug)) {
        console.log('StaticPageViewer: Skipping reserved route:', slug);
        return;
      }
      

      try {
        // Try static_pages first
        let { data, error } = await supabase
          .from("static_pages")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        // If not found in static_pages, try blog_posts
        if (!data && !error) {
          const { data: blogData, error: blogError } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .eq("published", true)
            .maybeSingle();
          
          // Convert blog post data to match our interface
          if (blogData) {
            data = {
              ...blogData,
              html_file_path: null,
              is_homepage: false,
              show_in_menu: true,
              show_in_header: true
            };
          }
          error = blogError;
        }

        if (error) {
          setError("Oldal nem található");
          return;
        }

        if (!data) {
          setError("Oldal nem található");
          return;
        }

        console.log('Page loaded successfully:', data.title);
        setPage(data);
        
        // Only fetch page mapping if HTML contains dynamic links
        let pageMapping: Map<string, string> | undefined;
        if (hasDynamicLinks(data.html_content)) {
          pageMapping = await fetchPageMapping();
        }
        
        // Process HTML content
        const processed = processHtmlContent(data.html_content, pageMapping);
        setProcessedHtml(processed);
      } catch (err) {
        setError("Hiba történt az oldal betöltésekor");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, hasDynamicLinks, fetchPageMapping]);

  // Memoized HTML processing for better performance
  const processHtmlContent = useMemo(() => (htmlContent: string, pageMapping?: Map<string, string>) => {
    let processedHtml = htmlContent;
    
    // Fix all href attributes that contain page names instead of paths
    if (pageMapping) {
      // Process all href attributes
      processedHtml = processedHtml.replace(
        /href=["']([^"']+)["']/g,
        (match, href) => {
          // Skip external links, anchors, and already correct paths
          if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('/')) {
            return match;
          }
          
          // Clean and normalize the href value for mapping lookup
          const cleanHref = href.trim().toLowerCase()
            .replace(/\.html?$/, '') // Remove file extensions
            .replace(/[áàâäã]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòôöõ]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ö]/g, 'o')
            .replace(/[ü]/g, 'u')
            .replace(/[ő]/g, 'o')
            .replace(/[ű]/g, 'u');
          
          // Try to find the correct slug
          const slug = pageMapping.get(cleanHref);
          if (slug) {
            console.log(`Fixed link: ${href} -> /${slug}`);
            return `href="/${slug}"`;
          }
          
          // If not found, return original but warn
          console.warn(`Could not resolve link: ${href}`);
          return match;
        }
      );
      
    // Handle buttons with data-bs-target attributes
      processedHtml = processedHtml.replace(
        /data-bs-target=["']\{\{([^}]+)\}\}["']/g,
        (match, identifier) => {
          const cleanId = identifier.trim().toLowerCase();
          const slug = pageMapping.get(cleanId);
          if (slug) {
            console.log(`Fixed button target: ${identifier} -> /${slug}`);
            return `onclick="window.location.href='/${slug}'"`;
          }
          return 'onclick="window.location.href=\'#\'"';
        }
      );
      
      // Also handle dynamic placeholders {{}} and data-page attributes
      processedHtml = processedHtml.replace(
        /(?:href=["']\{\{([^}]+)\}\}["']|data-page=["']([^"']+)["'])/g, 
        (match, placeholderContent, dataPageContent) => {
          const identifier = (placeholderContent || dataPageContent).trim().toLowerCase();
          const slug = pageMapping.get(identifier);
          if (slug) {
            console.log(`Resolved dynamic link: ${identifier} -> /${slug}`);
            return `href="/${slug}"`;
          }
          console.warn(`Could not resolve dynamic link: ${identifier}`);
          return 'href="#"';
        }
      );
    }
    
    // Convert logo links to point to homepage
    processedHtml = processedHtml.replace(
      /<a[^>]*href=["'][^"']*["'][^>]*><img[^>]*src=["'][^"']*logo[^"']*["'][^>]*><\/a>/gi,
      (match) => {
        return match.replace(/href=["'][^"']*["']/, 'href="/"');
      }
    );
    
    // Ensure gradients are properly handled - add bg-gradient classes if missing
    processedHtml = processedHtml.replace(
      /class="bg-gradient-body"/g,
      'class="bg-gradient-body" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"'
    );
    
    processedHtml = processedHtml.replace(
      /class="([^"]*?)bg-gradient-dark([^"]*?)"/g,
      'class="$1bg-gradient-dark$2" style="background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%);"'
    );
    
    // Fix homepage gradient background specifically
    processedHtml = processedHtml.replace(
      /<div([^>]*class="[^"]*hero[^"]*"[^>]*)>/g,
      (match, attrs) => {
        if (!attrs.includes('style=') && !attrs.includes('background:')) {
          return match.replace('>', ' style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">');
        }
        return match;
      }
    );
    
    // Fix missing assets by replacing with available ones from storage
    processedHtml = processedHtml.replace(/hirleveles_logo_adsba másolat\.png/g, 'feher_hirleveles_logo__350.png');
    processedHtml = processedHtml.replace(/hirleveles_logo_adsba%20másolat\.png/g, 'feher_hirleveles_logo__350.png');
    processedHtml = processedHtml.replace(/hirleveles_logo_adsba%20m%C3%A1solat\.png/g, 'feher_hirleveles_logo__350.png');
    
    // Fix missing team images with available ones (remove accents from filenames)
    processedHtml = processedHtml.replace(/N%C3%A9vtelen%20terv%20\(10\)\.png/g, 'avatar2.jpg');
    processedHtml = processedHtml.replace(/N%C3%A9vtelen%20terv%20\(8\)\.webp/g, 'avatar4.jpg');
    processedHtml = processedHtml.replace(/Névtelen terv \(10\)\.png/g, 'avatar2.jpg');
    processedHtml = processedHtml.replace(/Névtelen terv \(8\)\.webp/g, 'avatar4.jpg');
    
    // Fix specific missing team member images
    processedHtml = processedHtml.replace(/bia\.jpg/g, 'avatar1.jpg');
    processedHtml = processedHtml.replace(/tibi\.jpg/g, 'avatar3.jpg');
    processedHtml = processedHtml.replace(/tamas\.jpg/g, 'avatar5.jpg');
    processedHtml = processedHtml.replace(/tama%CC%81s\.jpg/g, 'avatar5.jpg');
    processedHtml = processedHtml.replace(/bianka\.webp/g, 'avatar1.jpg');
    processedHtml = processedHtml.replace(/tibi\.webp/g, 'avatar3.jpg');
    
    // Clear browser cache for assets by adding timestamp to CSS/JS files
    processedHtml = processedHtml.replace(/href="(\/assets\/[^"]+\.css)"/g, `href="$1?v=${Date.now()}"`);
    processedHtml = processedHtml.replace(/src="(\/assets\/[^"]+\.js)"/g, `src="$1?v=${Date.now()}"`);
    
    // Convert buttons with data-bs-target to proper anchor links
    processedHtml = processedHtml.replace(/<button([^>]*?)data-bs-target=["']([^"']+)["']([^>]*?)>([^<]+)<\/button>/g, (match, beforeAttr, target, afterAttr, text) => {
      let href = target;
      // Process the target URL the same way as other links
      if (target.includes('.html')) {
        if (!target.startsWith('http://') && !target.startsWith('https://') && !target.startsWith('//')) {
          const relativePath = target.replace(/\.html$/, '').replace(/^\//, '');
          href = `/${relativePath}`;
        } else {
          // For external URLs, extract the path part
          const urlParts = target.split('/');
          const fileName = urlParts[urlParts.length - 1];
          if (fileName.includes('.html')) {
            const relativePath = fileName.replace(/\.html$/, '');
            href = `/${relativePath}`;
          }
        }
      }
      return `<a href="${href}"${beforeAttr}${afterAttr} class="btn btn-primary active">${text}</a>`;
    });

    // Convert .html links to relative links (remove .html extension)
    processedHtml = processedHtml.replace(/href=["']([^"']*\.html)["']/g, (match, url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
        const relativePath = url.replace(/\.html$/, '').replace(/^\//, '');
        return `href="/${relativePath}"`;
      }
      return match;
    });

    // Convert any relative links without extensions to proper React routes
    processedHtml = processedHtml.replace(/href=["']([^"'#]*[^"'\/.#])["']/g, (match, url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//') && !url.startsWith('#') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
        const cleanPath = url.replace(/^\//, '');
        return `href="/${cleanPath}"`;
      }
      return match;
    });

    // Get assets path - use edge function for proper CORS headers
    const edgeFunctionUrl = 'https://nabvfsbrrasdsaibnyby.supabase.co/functions/v1/serve-assets';
    
    // Use common-assets path for all assets
    const assetsPath = 'common-assets';
    
    console.log('Using assets path:', `${edgeFunctionUrl}/${assetsPath}`);
    
    // Replace all asset URLs - use edge function for proper CORS headers
    processedHtml = processedHtml.replace(/href=["']\/assets\/([^"']*)["']/g, `href="${edgeFunctionUrl}/${assetsPath}/$1"`);
    processedHtml = processedHtml.replace(/src=["']\/assets\/([^"']*)["']/g, `src="${edgeFunctionUrl}/${assetsPath}/$1"`);
    
    // Handle CSS background images in stylesheets and inline styles
    processedHtml = processedHtml.replace(/url\(["']?\/assets\/([^"')]*)["']?\)/g, `url("${edgeFunctionUrl}/${assetsPath}/$1")`);
    processedHtml = processedHtml.replace(/background-image:\s*url\(["']?\/assets\/([^"')]*)["']?\)/g, `background-image: url("${edgeFunctionUrl}/${assetsPath}/$1")`);
    processedHtml = processedHtml.replace(/background:\s*url\(["']?\/assets\/([^"')]*)["']?\)/g, `background: url("${edgeFunctionUrl}/${assetsPath}/$1")`);
    
    // Replace font URLs and other direct Supabase storage URLs to go through serve-assets function
    // More comprehensive regex to catch all storage URLs
    processedHtml = processedHtml.replace(/https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/storage\/v1\/object\/public\/assets\/([^"'\s)]+)/g, `${edgeFunctionUrl}/${assetsPath}/$1`);
    processedHtml = processedHtml.replace(/https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/assets\/([^"'\s)]+)/g, `${edgeFunctionUrl}/${assetsPath}/$1`);
    
    // Handle @font-face and other CSS font declarations more comprehensively
    processedHtml = processedHtml.replace(/@font-face\s*{[^}]*url\(["']?https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/(?:storage\/v1\/object\/public\/)?assets\/([^"'\s)]+)["']?\)[^}]*}/g, (match, fontPath) => {
      return match.replace(/https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/(?:storage\/v1\/object\/public\/)?assets\/[^"'\s)]+/g, `${edgeFunctionUrl}/${assetsPath}/${fontPath}`);
    });
    
    // Handle inline CSS font URLs in style attributes
    processedHtml = processedHtml.replace(/style=["']([^"']*font[^"']*)["']/g, (match, styleContent) => {
      const updatedStyle = styleContent.replace(/url\(["']?https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/(?:storage\/v1\/object\/public\/)?assets\/([^"'\s)]+)["']?\)/g, `url("${edgeFunctionUrl}/${assetsPath}/$1")`);
      return `style="${updatedStyle}"`;
    });
    
    // Handle font URLs in CSS link tags
    processedHtml = processedHtml.replace(/<link[^>]*href=["']https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/(?:storage\/v1\/object\/public\/)?assets\/([^"']+)["'][^>]*>/g, (match, assetPath) => {
      return match.replace(/https:\/\/nabvfsbrrasdsaibnyby\.supabase\.co\/(?:storage\/v1\/object\/public\/)?assets\/[^"']+/g, `${edgeFunctionUrl}/${assetsPath}/${assetPath}`);
    });

    return processedHtml;
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Oldal betöltése...</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {error || "Oldal nem található"}
            </h1>
            <p className="text-muted-foreground">
              A keresett oldal nem létezik vagy nem érhető el.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div 
        className="min-h-screen"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      <CookieConsent />
    </>
  );
}