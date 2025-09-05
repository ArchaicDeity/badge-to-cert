import fs from 'fs/promises';
import path from 'path';

export interface UpdatePayload {
  content_type?: string;
  [key: string]: unknown;
}

/**
 * Apply updates to an object while respecting the provided content_type.
 * - When content_type is "application/pdf" only the `pdf` field can be updated.
 * - For any other content_type all fields except `pdf` are updated.
 */
export function applyConditionalUpdate<T extends Record<string, unknown>>(original: T, payload: UpdatePayload): T {
  const { content_type, ...rest } = payload;
  const updated: Record<string, unknown> = { ...original };

  if (!content_type) {
    Object.assign(updated, rest);
    return updated as T;
  }

  if (content_type === 'application/pdf') {
    if (Object.prototype.hasOwnProperty.call(rest, 'pdf')) {
      updated['pdf'] = rest['pdf'];
    }
    return updated as T;
  }

  // For non-pdf content types, ignore attempts to update the `pdf` field
  for (const [key, value] of Object.entries(rest)) {
    if (key === 'pdf') continue;
    updated[key] = value;
  }
  return updated as T;
}

/**
 * Replace an existing PDF file with a new one. When an old file path is
 * provided, it will be removed before the new file is written.
 *
 * @param oldPath  Relative path of the existing file inside `uploadDir`.
 * @param newFile  Buffer containing the new PDF data.
 * @param uploadDir Directory where PDF files are stored.
 * @returns The filename of the newly written PDF.
 */
export async function replacePdf(oldPath: string | undefined, newFile: Buffer, uploadDir: string): Promise<string> {
  await fs.mkdir(uploadDir, { recursive: true });

  if (oldPath) {
    try {
      await fs.unlink(path.join(uploadDir, oldPath));
    } catch {
      // File may not exist; ignore errors
    }
  }

  const filename = `file-${Date.now()}.pdf`;
  await fs.writeFile(path.join(uploadDir, filename), newFile);
  return filename;
}
