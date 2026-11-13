import JSZip from 'jszip';
import { CapturedPhotoRecord } from '../types/photobooth';
import { StorageFileItem } from './supabase';

/**
 * Packages all photos from the current session into a single ZIP file
 * and triggers immediate local download for guests.
 * All photos exported with .jpg extension.
 */
export async function downloadAllPhotosAsZip(
  photos: CapturedPhotoRecord[],
  sessionId: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (photos.length === 0) return;

  const zip = new JSZip();
  const folderName = `fotos_${sessionId}`;
  const folder = zip.folder(folderName) || zip;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    try {
      const response = await fetch(photo.localBlobUrl);
      const blob = await response.blob();
      const fileName = `foto_${i + 1}_${photo.mode === 'strip' ? 'tira' : 'individual'}_${photo.timestamp}.jpg`;
      folder.file(fileName, blob);
      if (onProgress) {
        onProgress(Math.round(((i + 1) / photos.length) * 80));
      }
    } catch (err) {
      console.warn('Could not add photo to zip, trying publicUrl fallback:', err);
      if (photo.publicUrl) {
        try {
          const response = await fetch(photo.publicUrl);
          const blob = await response.blob();
          const fileName = `foto_${i + 1}_${photo.timestamp}.jpg`;
          folder.file(fileName, blob);
        } catch {
          // ignore individual failure
        }
      }
    }
  }

  const content = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) {
        onProgress(80 + Math.round(metadata.percent * 0.2));
      }
    }
  );

  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `fotos_${sessionId}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 30000);
}

/**
 * Packages all photos from the entire Supabase bucket for the Administrator
 * and triggers immediate local download (.ZIP)
 */
export async function downloadAllBucketPhotosAsZip(
  files: StorageFileItem[],
  onProgress?: (percent: number) => void
): Promise<void> {
  if (files.length === 0) return;

  const zip = new JSZip();
  const rootFolder = zip.folder('evento_completo_fotocabina') || zip;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const response = await fetch(file.publicUrl);
      const blob = await response.blob();
      // Keep session folder structure or clean names
      const subFolder = file.folder && file.folder !== 'root' ? rootFolder.folder(file.folder) || rootFolder : rootFolder;
      const cleanFileName = file.name.endsWith('.jpg') ? file.name : `${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
      subFolder.file(cleanFileName, blob);

      if (onProgress) {
        onProgress(Math.round(((i + 1) / files.length) * 85));
      }
    } catch (err) {
      console.warn(`Could not add ${file.name} to zip:`, err);
    }
  }

  const content = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 5 } },
    (metadata) => {
      if (onProgress) {
        onProgress(85 + Math.round(metadata.percent * 0.15));
      }
    }
  );

  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `evento_completo_fotocabina_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 30000);
}
