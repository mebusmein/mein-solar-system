import React, { use, useMemo, useState } from "react";
import { FaCog } from "react-icons/fa";
import { useSetTheme, useTheme } from "../../libs/theme";
import { useFocus } from "../../libs/focus";

function UI() {
  const theme = useTheme();
  const { toggleTheme } = useSetTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const focus = useFocus();

  const data = useMemo(() => {
    return JSON.stringify(focus, null, 2);
  }, [focus]);

  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-webpage pointer-events-none">
        <div>
          <h1 className="text-2xl font-bold">Mein System</h1>
          <p className="text-sm mt-1">
            Explore the locations and servers in the Mein solar system.
          </p>
          <p>
            {focus.type === "sun" ? "Star" : "Planet"}: {focus.data?.name}
          </p>
        </div>
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text- text-2xl focus:outline-none"
          >
            <FaCog />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 text-webpage rounded shadow-lg">
              <button
                onClick={toggleTheme}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
              >
                Toggle Theme
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full"></div>

      {/* Footer */}
      <footer className="p-4 flex justify-between items-center text-webpage text-sm pointer-events-auto">
        <span>&copy; {new Date().getFullYear()}</span>
        <span>Made by Tim Mein</span>
      </footer>
    </div>
  );
}

export default UI;
