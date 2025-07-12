import { supabase } from "@/integrations/supabase/client";

export async function extractZipAssets(zipFileName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('extract-assets', {
      body: { zipFileName }
    });

    if (error) {
      console.error('Error extracting ZIP:', error);
      return false;
    }

    console.log('ZIP extraction result:', data);
    return data.success;
  } catch (error) {
    console.error('Failed to extract ZIP:', error);
    return false;
  }
}

// Auto-extract function for known ZIP files
export async function autoExtractAssets() {
  const zipFiles = [
    'hirleveleshu-8211-az-email-marketing-ceg-email-marketing-hirlevel-szovegiras-megirjuk-a-penzt-assets.zip',
    'mailerlite-hasznalata-magyarul-assets.zip'
  ];

  for (const zipFile of zipFiles) {
    console.log(`Extracting ${zipFile}...`);
    await extractZipAssets(zipFile);
  }
}