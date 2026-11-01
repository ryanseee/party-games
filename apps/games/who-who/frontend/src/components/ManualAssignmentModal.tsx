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
    <div className="fixed inset-0 z-50 bg-gameBorder/80 flex items-center justify-center p-4">
      <div className="bg-gameSurface border-2 border-gameBorder shadow-[8px_8px_0px_var(--chalk-shadow)] w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="border-b-2 border-gameBorder p-4 flex items-center justify-between bg-gameBg">
          <div>
            <span className="font-['Space_Mono',_monospace] text-[10px] uppercase tracking-widest text-gameText bg-gameSuccess px-2 py-0.5 border border-gameBorder font-bold inline-block">
              MANUAL CONTROL // 03
            </span>
            <h2 className="font-['Space_Mono'] text-lg font-bold text-gameText uppercase">
              Manual Photo Assignment
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-gameBorder text-white font-['Space_Mono'] text-xs px-3 py-1 border border-gameBorder hover:brightness-95 cursor-pointer font-bold"
          >
            [ CLOSE ]
          </button>
        </div>

        {/* Instructions Banner */}
        <div className="bg-gameCoral border-b-2 border-gameBorder px-4 py-2">
          <p className="font-['Space_Mono',_monospace] text-xs text-gameText">
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
            <div className="flex items-center justify-between border-b-2 border-gameBorder pb-2">
              <span className="font-['Space_Mono'] text-sm font-bold uppercase text-gameText">
                Participants ({participants.length})
              </span>
              <span className="font-['Space_Mono',_monospace] text-[10px] text-gameMuted">
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
                      className={`p-3 border-2 border-gameBorder cursor-pointer transition-all flex items-center justify-between shadow-[2px_2px_0px_var(--chalk-shadow)] ${
                        isSelected
                          ? "bg-gameAccent text-gameText"
                          : "bg-gameBg hover:bg-gameGold text-gameText"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border border-gameBorder bg-gameSurface overflow-hidden flex items-center justify-center shrink-0">
                          {assignedPhoto ? (
                            <img
                              src={assignedPhoto.url}
                              alt={participant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-['Space_Mono',_monospace] text-[10px] text-gameMuted">
                              NONE
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-['Space_Mono'] text-sm font-bold uppercase">
                            {participant.name}
                          </p>
                          <p
                            className={`font-['Space_Mono',_monospace] text-[10px] ${
                              isSelected ? "text-gameText" : "text-gameMuted"
                            }`}
                          >
                            {assignedPhoto
                              ? "Photo assigned (Click to unassign)"
                              : "No photo assigned"}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="font-['Space_Mono',_monospace] text-[10px] bg-gameSurface text-gameText px-2 py-0.5 font-bold uppercase border border-gameBorder">
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
            <div className="flex items-center justify-between border-b-2 border-gameBorder pb-2">
              <span className="font-['Space_Mono'] text-sm font-bold uppercase text-gameText">
                Available Photos ({availablePhotos.length})
              </span>
            </div>

            {availablePhotos.length === 0 ? (
              <div className="border-2 border-dashed border-gameBorder bg-gameBg p-8 text-center space-y-1">
                <p className="font-['Space_Mono'] text-xs font-bold uppercase text-gameText">
                  No Unassigned Photos
                </p>
                <p className="font-['Space_Mono',_monospace] text-[10px] text-gameMuted">
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
                    className={`aspect-square border-2 border-gameBorder bg-gameBorder p-1 shadow-[2px_2px_0px_var(--chalk-shadow)] transition-transform ${
                      selectedParticipant
                        ? "cursor-pointer hover:scale-105 active:scale-95"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title || "Pool Image"}
                      className="w-full h-full object-cover border border-gameBorder bg-gameSurface"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t-2 border-gameBorder p-4 bg-gameBg flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gameSurface text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:bg-gameGold cursor-pointer font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="bg-gameMint text-gameText font-['Space_Mono'] text-xs uppercase px-4 py-2 border-2 border-gameBorder shadow-[2px_2px_0px_var(--chalk-shadow)] hover:brightness-95 cursor-pointer font-bold"
          >
            Confirm Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualAssignmentModal;
