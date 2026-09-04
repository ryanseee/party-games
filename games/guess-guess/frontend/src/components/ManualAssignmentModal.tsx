import React, { useState } from "react";
import Button from "./Button";
import { X } from "lucide-react";
import { Participant, Photo } from "../types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <Button variant="text" onClick={onClose} icon={<X size={20} />}>
              Close
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

interface ManualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  photos: Photo[];
  onAssign: (participantId: string, photoId: string | null) => void;
}

const ManualAssignmentModal: React.FC<ManualAssignmentModalProps> = ({
  isOpen,
  onClose,
  participants,
  photos,
  onAssign,
}) => {
  // Initialize tempAssignments with existing assignments
  const [tempAssignments, setTempAssignments] = useState<
    Record<string, string>
  >({});
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  );

  // Reset state and initialize with existing assignments when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const existingAssignments = participants.reduce((acc, participant) => {
        if (participant.photo_assigned) {
          acc[participant.id] = participant.photo_assigned;
        }
        return acc;
      }, {} as Record<string, string>);

      setTempAssignments(existingAssignments);
      setSelectedParticipant(null);
    }
  }, [isOpen, participants]);

  const handleParticipantClick = (participantId: string) => {
    if (selectedParticipant === participantId) {
      // If clicking the same participant again, mark for unassignment
      setTempAssignments((prev) => ({
        ...prev,
        [participantId]: "", // Empty string means unassign
      }));
      setSelectedParticipant(null);
    } else {
      setSelectedParticipant(participantId);
    }
  };

  const handlePhotoClick = (photoId: string) => {
    if (selectedParticipant && photoId) {
      setTempAssignments((prev) => ({
        ...prev,
        [selectedParticipant]: photoId,
      }));
      setSelectedParticipant(null);
    }
  };

  const handleConfirm = () => {
    Object.entries(tempAssignments).forEach(([participantId, photoId]) => {
      // Empty string means unassign, convert to null
      onAssign(participantId, photoId === "" ? null : photoId);
    });
    onClose();
  };

  const getAssignedPhoto = (participantId: string) => {
    // If there's a temp assignment (including empty string for unassign), use that
    if (participantId in tempAssignments) {
      const photoId = tempAssignments[participantId];
      return photoId ? photos.find((photo) => photo.id === photoId) : null;
    }
    // Otherwise use existing assignment
    const existingPhotoId = participants.find(
      (p) => p.id === participantId
    )?.photo_assigned;
    return existingPhotoId
      ? photos.find((photo) => photo.id === existingPhotoId)
      : null;
  };

  const getAvailablePhotos = () => {
    // Get all currently assigned photo IDs
    const assignedPhotoIds = new Set(
      participants
        .map((p) => {
          // If participant has a temp assignment, use that
          if (p.id in tempAssignments) {
            return tempAssignments[p.id];
          }
          // Otherwise use their existing assignment
          return p.photo_assigned;
        })
        .filter(Boolean) // Remove empty strings and nulls
    );

    return photos.filter(
      (photo) => photo.id && !assignedPhotoIds.has(photo.id)
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manual Photo Assignment">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Participants List */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Participants</h3>
            <div className="space-y-2">
              {[...participants]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedParticipant === participant.id
                        ? getAssignedPhoto(participant.id)
                          ? "border-red-500 bg-red-50"
                          : "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => handleParticipantClick(participant.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {getAssignedPhoto(participant.id) && (
                          <img
                            src={getAssignedPhoto(participant.id)?.url}
                            alt={participant.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {participant.name}
                        </p>
                        {getAssignedPhoto(participant.id) && (
                          <p className="text-sm text-gray-500">
                            Photo assigned
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Available Photos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Available Photos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getAvailablePhotos().map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => photo.id && handlePhotoClick(photo.id)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={Object.keys(tempAssignments).length === 0}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManualAssignmentModal;
