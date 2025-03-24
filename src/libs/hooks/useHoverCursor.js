import { useEffect, useState } from "react";

export default function useHoverCursor() {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => (document.body.style.cursor = "auto");
  }, [hovered]);

  return [hovered, setHovered];
}
