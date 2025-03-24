import React, { useState } from "react";
import SolarSystem from "./components/solarsystem/SolarSystem";
import UI from "./components/ui/UI";

function App() {
  const [selectedBody, setSelectedBody] = useState(0);

  return (
    <div className="h-full relative">
      <SolarSystem
        selectedBody={selectedBody}
        setSelectedBody={setSelectedBody}
      />
      <UI />
    </div>
  );
}

export default App;
