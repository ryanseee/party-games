import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import Card from "../components/Card";
import { Camera, Users, Sparkles } from "lucide-react";
import { useSession } from "../context/SessionContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { clearSession } = useSession();

  useEffect(() => {
    clearSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout showNav={true} title="Welcome to CaiCai">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">CaiCai</h1>
          <p className="mt-3 text-xl text-gray-600">
            A fun photo sharing game for friends, teams, and events
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card className="text-center p-8 bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center h-full">
              <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Join a Game</h2>
              <p className="text-gray-600 mb-6 flex-grow">
                Enter a session code to join an existing game
              </p>
              <Button
                onClick={() => navigate("/join")}
                fullWidth
                className="mt-auto"
              >
                Join Session
              </Button>
            </div>
          </Card>

          <Card className="text-center p-8 bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center h-full">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Create a Game</h2>
              <p className="text-gray-600 mb-6 flex-grow">
                Start a new game session as an admin
              </p>
              <Button
                onClick={() => navigate("/admin")}
                variant="secondary"
                fullWidth
                className="mt-auto"
              >
                Create Session
              </Button>
            </div>
          </Card>
        </div>

        <div className="my-12">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-amber-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">1</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Create a Session</h3>
              <p className="text-gray-600">
                Admin creates a game and uploads photos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Join the Game</h3>
              <p className="text-gray-600">
                Participants join using the session code
              </p>
            </div>

            <div className="text-center">
              <div className="bg-amber-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Receive Photos</h3>
              <p className="text-gray-600">
                Each participant gets assigned a random photo
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 my-10">
          <div className="flex items-center">
            <Sparkles className="h-10 w-10 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-2">
                Perfect for team building & events
              </h2>
              <p>
                Use CaiCai for ice breakers, team building, family gatherings,
                and more. Start a session now and have fun sharing photos!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Home;
