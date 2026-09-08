import React from "react";
import { Photo } from "../types";
import Card from "./Card";
import { Image, X } from "lucide-react";

interface PhotoGridProps {
  photos: Photo[];
  onSelectPhoto?: (photo: Photo) => void;
  selectedPhotoId?: string;
  onRemovePhoto?: (photo: Photo) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onSelectPhoto,
  selectedPhotoId,
  onRemovePhoto,
}) => {
  return (
    <div className="photo-grid my-4">
      <h2 className="text-xl font-semibold mb-3">Photos ({photos.length})</h2>

      {photos.length === 0 ? (
        <Card className="text-center py-8">
          <Image className="h-12 w-12 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">No photos uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload photos to assign to participants
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className={`p-0 overflow-hidden relative group ${
                onSelectPhoto ? "cursor-pointer" : ""
              } ${
                selectedPhotoId === photo.id ? "ring-2 ring-indigo-500" : ""
              }`}
              onClick={() => onSelectPhoto && onSelectPhoto(photo)}
            >
              <div className="aspect-square">
                <img
                  src={photo.url}
                  alt={photo.title || "Uploaded photo"}
                  className="w-full h-full object-cover"
                />
                {onRemovePhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(photo);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1
                              opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {photo.title && (
                <div className="p-2">
                  <p className="text-sm truncate">{photo.title}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;
