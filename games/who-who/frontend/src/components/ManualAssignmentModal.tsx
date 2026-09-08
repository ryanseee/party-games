import React, { useState, useEffect } from "react";
import { Participant, Photo } from "../types";

interface ManualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  photos: Photo[];
  onAssignPhoto: (participantId: string, photoId: string | null) => void;
}

const ManualAssignmentModal: React.FC<ManualAssignmentModalProps> = ({
  isOpen,
  onClose,
  participants,
  photos,
  onAssignPhoto,
}) => {
  // Temporary assignments map: { participantId: photoId (or "" for unassign) }
  const [tempAssignments, setTempAssignments] = useState<
    Record<string, string>
  >({});
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null,
  );

  // Initialize and reset assignments whenever modal opens or participants change
  useEffect(() => {
    if (isOpen) {
      const existingAssignments = participants.reduce(
        (acc, participant) => {
          if (participant.photo_assigned) {
            acc[participant.id] = participant.photo_assigned;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      setTempAssignments(existingAssignments);
      setSelectedParticipant(null);
    }
  }, [isOpen, participants]);

  if (!isOpen) return null;

  // Handle clicking a participant
  const handleParticipantClick = (participantId: string) => {
    if (selectedParticipant === participantId) {
      // If clicking the same selected participant again, unassign them
      setTempAssignments((prev) => ({
        ...prev,
        [participantId]: "", // Empty string represents unassigned
      }));
      setSelectedParticipant(null);
    } else {
      setSelectedParticipant(participantId);
    }
  };

  // Handle clicking an available photo
  const handlePhotoClick = (photoId: string) => {
    if (selectedParticipant && photoId) {
      setTempAssignments((prev) => ({
        ...prev,
        [selectedParticipant]: photoId,
      }));
      setSelectedParticipant(null);
    }
  };

  // Get current active photo for a participant
  const getAssignedPhoto = (participantId: string) => {
    if (participantId in tempAssignments) {
      const photoId = tempAssignments[participantId];
      return photoId ? photos.find((photo) => photo.id === photoId) : null;
    }
    const existingPhotoId = participants.find(
      (p) => p.id === participantId,
    )?.photo_assigned;
    return existingPhotoId
      ? photos.find((photo) => photo.id === existingPhotoId)
      : null;
  };

  // Filter out photos that are currently assigned
  const getAvailablePhotos = () => {
    const assignedPhotoIds = new Set(
      participants
        .map((p) => {
          if (p.id in tempAssignments) {
            return tempAssignments[p.id];
          }
          return p.photo_assigned;
        })
        .filter(Boolean),
    );

    return photos.filter(
      (photo) => photo.id && !assignedPhotoIds.has(photo.id),
    );
  };

  // Apply all pending assignments
  const handleConfirm = () => {
    Object.entries(tempAssignments).forEach(([participantId, photoId]) => {
      onAssignPhoto(participantId, photoId === "" ? null : photoId);
    });
    onClose();
  };

  const availablePhotos = getAvailablePhotos();

  return (
    <div className="fixed inset-0 z-50 bg-[#06080c]/80 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#06080c] shadow-[8px_8px_0px_#06080c] w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="border-b-2 border-[#06080c] p-4 flex items-center justify-between bg-[#f8f9fb]">
          <div>
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#45474b] font-bold block">
              MANUAL CONTROL // 03
            </span>
            <h2 className="font-['Space_Mono'] text-lg font-bold text-[#06080c] uppercase">
              Manual Photo Assignment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#06080c] text-white font-['Space_Mono'] text-xs px-3 py-1 border border-[#06080c] hover:bg-[#1e2024] cursor-pointer font-bold"
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Instructions Banner */}
        <div className="bg-[#edeef0] border-b-2 border-[#06080c] px-4 py-2">
          <p className="font-['JetBrains_Mono'] text-xs text-[#06080c]">
            <span className="font-bold">INSTRUCTIONS:</span> Select a
            participant on the left, then click an available photo on the right
            to assign it. Click an assigned participant again to clear their
            photo.
          </p>
        </div>

        {/* Side-by-Side Interactive View */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Left Column: Participants List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#06080c] pb-2">
              <span className="font-['Space_Mono'] text-sm font-bold uppercase text-[#06080c]">
                Participants ({participants.length})
              </span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#45474b]">
                {selectedParticipant ? "1 SELECTED" : "SELECT A PLAYER"}
              </span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {[...participants]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((participant) => {
                  const assignedPhoto = getAssignedPhoto(participant.id);
                  const isSelected = selectedParticipant === participant.id;

                  return (
                    <div
                      key={participant.id}
                      onClick={() => handleParticipantClick(participant.id)}
                      className={`p-3 border-2 border-[#06080c] cursor-pointer transition-all flex items-center justify-between shadow-[2px_2px_0px_#06080c] ${
                        isSelected
                          ? "bg-[#06080c] text-white"
                          : "bg-[#f8f9fb] hover:bg-[#edeef0] text-[#06080c]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-[#06080c] bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {assignedPhoto ? (
                            <img
                              src={assignedPhoto.url}
                              alt={participant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-['JetBrains_Mono'] text-[10px] text-[#76777b]">
                              NONE
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-['Space_Mono'] text-sm font-bold uppercase">
                            {participant.name}
                          </p>
                          <p
                            className={`font-['JetBrains_Mono'] text-[10px] ${
                              isSelected ? "text-gray-300" : "text-[#45474b]"
                            }`}
                          >
                            {assignedPhoto
                              ? "Photo assigned (Click to unassign)"
                              : "No photo assigned"}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="font-['JetBrains_Mono'] text-[10px] bg-white text-[#06080c] px-2 py-0.5 font-bold uppercase border border-[#06080c]">
                          TARGET
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Available Photos Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#06080c] pb-2">
              <span className="font-['Space_Mono'] text-sm font-bold uppercase text-[#06080c]">
                Available Photos ({availablePhotos.length})
              </span>
            </div>

            {availablePhotos.length === 0 ? (
              <div className="border-2 border-dashed border-[#06080c] bg-[#f8f9fb] p-8 text-center space-y-1">
                <p className="font-['Space_Mono'] text-xs font-bold uppercase text-[#06080c]">
                  No Unassigned Photos
                </p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-[#45474b]">
                  All photos in the pool have been assigned or none are
                  uploaded.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {availablePhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => photo.id && handlePhotoClick(photo.id)}
                    className={`aspect-square border-2 border-[#06080c] bg-[#06080c] p-1 shadow-[2px_2px_0px_#06080c] transition-transform ${
                      selectedParticipant
                        ? "cursor-pointer hover:scale-105 active:scale-95"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title || "Pool Image"}
                      className="w-full h-full object-cover border border-[#06080c] bg-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t-2 border-[#06080c] p-4 bg-[#f8f9fb] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white text-[#06080c] font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-[#06080c] shadow-[2px_2px_0px_#06080c] hover:bg-[#edeef0] cursor-pointer font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-[#06080c] text-white font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-[#06080c] shadow-[2px_2px_0px_#76777b] hover:bg-[#1e2024] cursor-pointer font-bold"
          >
            Confirm Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAssignmentModal;
