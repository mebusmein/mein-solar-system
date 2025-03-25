import React, { useState } from "react";
import SolarSystem from "./components/solarsystem/SolarSystem";
import UI2 from "./components/ui/UI2";
import { CommandCenterProvider } from "./libs/prompt/commandCenter";

function App() {
  const [selectedBody, setSelectedBody] = useState(0);

  return (
    <div className="h-full relative">
      <CommandCenterProvider>
        <SolarSystem
          selectedBody={selectedBody}
          setSelectedBody={setSelectedBody}
        />
        <UI2 />
      </CommandCenterProvider>
    </div>
  );
}

export default App;
