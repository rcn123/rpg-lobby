'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface ImagePickerProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  className?: string;
}

export function ImagePicker({ value, onChange, className = '' }: ImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Update preview when value prop changes
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Clear any previous errors
    setError(null);
    
    // Handle rejected files (too large, wrong type, etc.)
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Please select an image smaller than 5MB.');
        return;
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please select a PNG, JPG, GIF, or WebP image.');
        return;
      } else {
        setError('File could not be uploaded. Please try again.');
        return;
      }
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      console.log('=== UPLOAD START ===');
      
      // Create a preview URL
      console.log('Creating preview URL...');
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      console.log('Preview URL created:', previewUrl);
      
      // User should be authenticated since this component is only used on protected pages
      if (!user) {
        console.error('No user found in auth context');
        throw new Error('User not authenticated - please log in again');
      }
      console.log('User authenticated:', user.id);
      
      // Generate hash for deduplication but keep original filename
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Clean filename and add timestamp to avoid conflicts
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const fileName = `session-images/${user.id}/${cleanName}_${timestamp}`;
      
      console.log('About to upload:', { fileName, fileSize: file.size, fileType: file.type, hash: hashHex });
      
      // Upload file with upsert and timeout
      console.log('Starting upload to Supabase...');
      const uploadPromise = supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
          metadata: {
            hash: hashHex,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
      );
      
      console.log('Waiting for upload response...');
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      console.log('Upload response received:', { data, error });
      
      if (error) {
        console.error('Upload failed with error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('Upload succeeded but no data returned');
        throw new Error('No data returned from upload');
      }
      
      console.log('Upload successful, getting public URL...');
      // Get public URL using Supabase method
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);
      
      console.log('Upload data:', data);
      console.log('Public URL generated:', publicUrl);
      console.log('Calling onChange with URL...');
      onChange(publicUrl);
      console.log('=== UPLOAD COMPLETE ===');
      
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = () => {
    if (window.confirm('Are you sure you want to remove this image?')) {
      setPreview(null);
      setError(null);
      onChange('');
      console.log('Image removed');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {preview && (
        <div className="relative">
          <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600">
            {preview?.includes('supabase.co') ? (
              <img
                src={preview}
                alt="Session preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={preview}
                alt="Session preview"
                fill
                className="object-cover"
              />
            )}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors shadow-lg z-10"
              disabled={isUploading}
              title="Remove image"
              aria-label="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Area - only show when no image is selected */}
      {!preview && (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading image...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {isDragActive ? 'Drop your image here' : 'Upload a session image'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag & drop an image, or click to select
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
        </div>
      )}

    </div>
  );
}
