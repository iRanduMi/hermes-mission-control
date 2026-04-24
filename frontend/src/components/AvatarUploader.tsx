import { useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function AvatarUploader({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
}: AvatarUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(
    currentAvatarUrl || null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP`);
        return;
      }

      if (file.size > MAX_SIZE) {
        setError(`File too large: ${Math.round(file.size / 1024 / 1024)}MB (max 5MB)`);
        return;
      }

      setUploading(true);
      try {
        const result = await api.uploadAvatar(userId, file);
        const url = `${result.url}?t=${Date.now()}`;
        setPreview(url);
        onUploadSuccess(url);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [userId, onUploadSuccess]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  return (
    <div className="space-y-3">
      <div
        className={`
          relative flex flex-col items-center justify-center
          w-32 h-32 rounded-full border-2 border-dashed cursor-pointer
          transition-colors duration-200
          ${dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Drop image here</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        JPEG, PNG, or WebP • Max 5MB
      </p>

      {error && (
        <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
