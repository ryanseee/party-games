import React, { useState, useRef } from "react";
import { useSession } from "../context/SessionContext";
import { Photo } from "../types";
import Button from "./Button";
import { Upload, X } from "lucide-react";
import imageCompression from "browser-image-compression";

interface PhotoUploaderProps {
  onUploadComplete: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.2, // Reduce max size to 200KB per image
  maxWidthOrHeight: 1280, // Reduce max dimension to 1280px
  useWebWorker: true,
  initialQuality: 0.5, // Start with lower quality
};

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onUploadComplete,
}) => {
  const { currentSession, uploadPhotos } = useSession();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
    }
    if (!file.type.startsWith("image/")) {
      throw new Error(`File ${file.name} is not an image`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files first
    for (const file of files) {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Invalid file");
      }
    }

    if (errors.length > 0) {
      alert(`Some files were not added:\n${errors.join("\n")}`);
    }

    if (validFiles.length === 0) return;

    // Add valid files to state
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Generate previews for valid files
    for (const file of validFiles) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error generating preview:", error);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !currentSession) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const photos: Photo[] = [];
      const totalFiles = selectedFiles.length;

      // Process files sequentially
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        try {
          // Compress the image
          const compressedFile = await imageCompression(
            file,
            COMPRESSION_OPTIONS
          );

          // Convert to base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedFile);
          });

          photos.push({
            url: base64,
            title: file.name,
            session_id: currentSession.id,
            uploaded_at: new Date().toISOString(),
          });

          // Update progress
          setUploadProgress(((i + 1) / totalFiles) * 100);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          throw new Error(`Failed to process ${file.name}`);
        }
      }

      // Upload all processed photos
      await uploadPhotos(photos);
      onUploadComplete();

      // Clear state
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert(error instanceof Error ? error.message : "Failed to upload photos");
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="photo-uploader my-6">
      <div className="flex flex-col items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />

        <div
          onClick={openFileDialog}
          className="border-2 border-dashed rounded-lg p-8 w-full text-center transition-colors border-gray-300 cursor-pointer hover:border-indigo-500"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-1 text-sm text-gray-600">
            Click to upload photos, or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>

        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="h-32 w-full object-cover rounded-lg shadow-sm"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="mt-4 w-full">
            {isUploading && (
              <div className="mb-4">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1 text-center">
                  Processing photos... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              icon={<Upload size={18} />}
              className="w-full"
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${selectedFiles.length} photos`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
