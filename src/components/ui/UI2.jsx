import React, { useState, useEffect, useRef } from "react";
import { useCommandCenter, useMessages } from "../../libs/prompt/commandCenter";
import { useMount } from "ahooks";
import { runStory } from "../../libs/story/story"; // Import the refactored story function

function UI2() {
  const messages = useMessages(); // Access shared messages state
  const [input, setInput] = useState(""); // State for the typing prompt
  const chatRef = useRef(null);

  const commandCenter = useCommandCenter();

  useMount(() => {
    console.log("UI2 mounted");
    runStory(commandCenter); // Call the story function
  });

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth", // Smooth scrolling to avoid jitter
      });
    }
  }, [messages]);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      commandCenter.parsePrompt(input); // Send input to CommandCenter
      setInput(""); // Clear the input field
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
      {/* Console-like Chat */}
      <div className="absolute top-0 left-0 w-full md:w-1/3 bg-black/50 text-webpage text-xs overflow-hidden md:rounded-br-lg pointer-events-auto font-mono">
        <div
          ref={chatRef}
          className="h-32 md:h-48 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-black/50"
        >
          {messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </div>
        {/* Typing Prompt */}
        <form
          onSubmit={handleInputSubmit}
          className="flex items-center p-2 border-t border-webpage"
        >
          <span className="text-webpage mr-2">{">"}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-webpage outline-none"
            placeholder="Type a command..."
          />
        </form>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 text-webpage pointer-events-none"></div>

      <div className="flex flex-col items-center justify-center h-full"></div>

      {/* Footer */}
      <footer className="p-4 flex justify-between items-center text-webpage text-sm pointer-events-auto">
        <span>&copy; {new Date().getFullYear()}</span>
        <span>Made by Tim Mein</span>
      </footer>
    </div>
  );
}

export default UI2;
