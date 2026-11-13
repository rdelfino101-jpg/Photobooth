import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://bkttryjmgpgdgpyjcgdv.supabase.co';
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdHRyeWptZ3BnZGdweWpjZ2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDE5MDAsImV4cCI6MjEwNzQ3NzkwMH0.GfkeG3O4RXkmt0frfMRjSMiFkPkeBHvUgPCsjf4E6ng';
export const BUCKET_NAME = 'photobooth';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  success: boolean;
  publicUrl: string;
  filePath: string;
  error?: string;
}

/**
 * Uploads a photo blob to Supabase Storage according to specifications:
 * - JPEG format (0.88 quality ~350KB)
 * - Extension: .jpg
 * - Route: `${sessionId}/foto_${Date.now()}.jpg` (strictly without leading slash)
 * - Options: { contentType: 'image/jpeg', upsert: true }
 */
export async function uploadPhotoToSupabase(
  blob: Blob,
  sessionId: string,
  customFileName?: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  // Strip any leading slashes
  const cleanSessionId = sessionId.replace(/^\/+/, '');
  const fileName = customFileName ? customFileName.replace(/^\/+/, '') : `foto_${timestamp}.jpg`;
  const filePath = `${cleanSessionId}/${fileName}`;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase upload notice:', error.message);
      // Retrieve public URL
      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: false,
        publicUrl: publicData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`,
        filePath,
        error: error.message,
      };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      filePath,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    console.error('Failed to upload photo to Supabase:', message);
    const fallbackUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
    return {
      success: false,
      publicUrl: fallbackUrl,
      filePath,
      error: message,
    };
  }
}

export interface LiveWallPhoto {
  id: string;
  name: string;
  publicUrl: string;
  created_at: string;
}

/**
 * Lists recently uploaded photos from Supabase Storage for the Live Wall projector.
 */
export async function listRecentPhotosFromSupabase(): Promise<LiveWallPhoto[]> {
  try {
    const { data: rootItems, error: rootErr } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (rootErr || !rootItems) {
      console.warn('Could not list root items in Supabase storage:', rootErr?.message);
      return [];
    }

    const results: LiveWallPhoto[] = [];

    for (const item of rootItems) {
      // If it's a file directly in root
      if (item.name.endsWith('.jpg') || item.name.endsWith('.jpeg') || item.name.endsWith('.png') || item.name.endsWith('.webp')) {
        const { data: pUrl } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(item.name);

        results.push({
          id: item.id || item.name,
          name: item.name,
          publicUrl: pUrl.publicUrl,
          created_at: item.created_at || new Date().toISOString(),
        });
      } else {
        // It's a folder (session id)
        const { data: subFiles } = await supabase.storage
          .from(BUCKET_NAME)
          .list(item.name, {
            limit: 50,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (subFiles && subFiles.length > 0) {
          for (const sub of subFiles) {
            if (sub.name.endsWith('.jpg') || sub.name.endsWith('.jpeg') || sub.name.endsWith('.png') || sub.name.endsWith('.webp')) {
              const fullPath = `${item.name}/${sub.name}`;
              const { data: subUrl } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fullPath);

              results.push({
                id: sub.id || fullPath,
                name: sub.name,
                publicUrl: subUrl.publicUrl,
                created_at: sub.created_at || item.created_at || new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    // Sort newest first
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return results;
  } catch (e) {
    console.warn('Failed listing photos for Live Wall:', e);
    return [];
  }
}

export interface StorageFileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  created_at: string;
  publicUrl: string;
  folder: string;
}

/**
 * Lists all photos in the photobooth bucket recursively for the Admin Storage Manager.
 */
export async function listAllBucketFiles(): Promise<StorageFileItem[]> {
  try {
    const { data: rootItems, error: rootErr } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 150,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (rootErr || !rootItems) {
      console.warn('Could not list root items:', rootErr?.message);
      return [];
    }

    const files: StorageFileItem[] = [];

    for (const item of rootItems) {
      const isImage = item.name.endsWith('.jpg') || item.name.endsWith('.jpeg') || item.name.endsWith('.png') || item.name.endsWith('.webp');

      if (isImage) {
        const { data: pUrl } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(item.name);

        files.push({
          id: item.id || item.name,
          name: item.name,
          path: item.name,
          size: (item.metadata as any)?.size || 350000,
          created_at: item.created_at || new Date().toISOString(),
          publicUrl: pUrl.publicUrl,
          folder: 'root',
        });
      } else {
        // Folder (session)
        const folderName = item.name;
        const { data: subItems } = await supabase.storage
          .from(BUCKET_NAME)
          .list(folderName, {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (subItems && subItems.length > 0) {
          for (const sub of subItems) {
            const isSubImage = sub.name.endsWith('.jpg') || sub.name.endsWith('.jpeg') || sub.name.endsWith('.png') || sub.name.endsWith('.webp');
            if (isSubImage) {
              const fullPath = `${folderName}/${sub.name}`;
              const { data: subUrl } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fullPath);

              files.push({
                id: sub.id || fullPath,
                name: sub.name,
                path: fullPath,
                size: (sub.metadata as any)?.size || 350000,
                created_at: sub.created_at || item.created_at || new Date().toISOString(),
                publicUrl: subUrl.publicUrl,
                folder: folderName,
              });
            }
          }
        }
      }
    }

    files.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return files;
  } catch (err) {
    console.error('Error listing all bucket files:', err);
    return [];
  }
}

/**
 * Calculates current bucket storage usage and statistics.
 */
export async function getBucketStorageStats(): Promise<{
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  sessionsCount: number;
}> {
  const files = await listAllBucketFiles();
  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 350000), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const sessions = new Set(files.map((f) => f.folder).filter((f) => f !== 'root'));

  return {
    totalFiles,
    totalSizeBytes,
    totalSizeFormatted: `${totalSizeMB} MB`,
    sessionsCount: sessions.size || (totalFiles > 0 ? 1 : 0),
  };
}

/**
 * Empties all photos from the photobooth bucket to free up the 1 GB tier for a new event.
 */
export async function emptyBucketStorage(): Promise<{ deletedCount: number; error?: string }> {
  try {
    const files = await listAllBucketFiles();
    if (files.length === 0) {
      return { deletedCount: 0 };
    }

    const pathsToDelete = files.map((f) => f.path);
    // Remove in batches of 50
    let totalDeleted = 0;
    const batchSize = 50;

    for (let i = 0; i < pathsToDelete.length; i += batchSize) {
      const batch = pathsToDelete.slice(i, i + batchSize);
      const { error } = await supabase.storage.from(BUCKET_NAME).remove(batch);
      if (error) {
        console.warn('Batch delete error:', error.message);
      } else {
        totalDeleted += batch.length;
      }
    }

    return { deletedCount: totalDeleted };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error eliminando archivos';
    return { deletedCount: 0, error: message };
  }
}
