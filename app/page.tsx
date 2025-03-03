"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";

import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure } from "livekit-client";
import type { ConnectionDetails } from "@/app/api/connection-details/route";
import { NoAgentNotification } from "@/app/components/NoAgentNotification";
import { CloseIcon } from "@/app/components/CloseIcon";
import { useKrispNoiseFilter } from "@livekit/components-react/krisp";
import { VoiceAssistantControlBar } from "./components/VoiceAssistantControlBar";

export default function Home() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [showAgent, setShowAgent] = useState(false);

  const onConnectButtonClicked = useCallback(async () => {
    setShowAgent(true);
    
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ??
        "/api/connection-details",
      window.location.origin
    );

    // Customize these values for your own application
    const userName = "Dr. John A. Zoidberg";
    const agentId = "agentId_1234567";
    const userId = "userId_123456789";

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        // Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, agentId, userId }),
    });
    const connectionDetailsData = await response.json();
    updateConnectionDetails(connectionDetailsData);
  }, []);

  const handleDisconnect = () => {
    updateConnectionDetails(undefined);
    setShowAgent(false);
  };

  return (
    <main
      data-lk-theme="default"
      className="h-screen relative bg-[var(--lk-bg)]"
    >
      {/* Start Agent Button - Fixed at bottom right */}
      <AnimatePresence>
        {!showAgent && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
            onClick={onConnectButtonClicked}
          >
            Start Agent
          </motion.button>
        )}
      </AnimatePresence>

      {/* Agent Popup Container */}
      <AnimatePresence>
        {showAgent && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 right-6 w-64 bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
          >
            <LiveKitRoom
              token={connectionDetails?.participantToken}
              serverUrl={connectionDetails?.serverUrl}
              connect={connectionDetails !== undefined}
              audio={true}
              video={false}
              onMediaDeviceFailure={onDeviceFailure}
              onDisconnected={handleDisconnect}
              className="flex flex-col"
            >
              <div className="p-3 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-300">Voice Assistant</span>
                  {agentState !== "disconnected" && (
                    <button 
                      onClick={handleDisconnect}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
                <SimpleVoiceAssistant onStateChange={setAgentState} />
                <VoiceControls agentState={agentState} />
              </div>
              <RoomAudioRenderer />
              <NoAgentNotification state={agentState} />
            </LiveKitRoom>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SimpleVoiceAssistant(props: {
  onStateChange: (state: AgentState) => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);
  
  return (
    <div className="h-12 w-full mb-2">
      <BarVisualizer
        state={state}
        barCount={10}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ 
          minHeight: 3, 
          maxHeight: 6,
          barWidth: 3,
          gap: 1,
          color: "#3B82F6" 
        }}
      />
    </div>
  );
}

function VoiceControls(props: { agentState: AgentState }) {
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    krisp.setNoiseFilterEnabled(true);
  }, []);

  if (props.agentState !== "disconnected" && props.agentState !== "connecting") {
    return (
      <div className="flex items-center justify-between">
        <VoiceAssistantControlBar controls={{ leave: false }} />
        <DisconnectButton>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-red-400">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </DisconnectButton>
      </div>
    );
  }
  
  return null;
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    "Error acquiring microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}


