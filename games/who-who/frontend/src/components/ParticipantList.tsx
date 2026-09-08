import React from "react";
import { Participant, Photo } from "../types";
import Card from "./Card";
import { User } from "lucide-react";

interface ParticipantListProps {
  participants: Participant[];
  photos: Photo[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  photos,
}) => {
  // Sort participants alphabetically by name
  const sortedParticipants = [...participants].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="participant-list my-4">
      <h2 className="text-xl font-semibold mb-3">
        Participants ({participants.length})
      </h2>

      {participants.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No participants have joined yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Share the session code to invite participants
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedParticipants.map((participant) => {
            const assignedPhoto = participant.photo_assigned
              ? photos.find((photo) => photo.id === participant.photo_assigned)
              : null;

            return (
              <Card key={participant.id} className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  {assignedPhoto ? (
                    <img
                      src={assignedPhoto.url}
                      alt="Assigned photo"
                      className="h-12 w-12 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{participant.name}</h3>
                  <p className="text-sm text-gray-500">
                    {assignedPhoto ? "Photo assigned" : "No photo assigned"}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
