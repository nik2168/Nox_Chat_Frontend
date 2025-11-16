import React, { useEffect } from "react";

const Title = ({
  title = "NOX Chat",
  description = "My First MERN Project",
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
    if (description) {
      const meta =
        document.querySelector("meta[name='description']") ||
        (() => {
          const m = document.createElement("meta");
          m.name = "description";
          document.head.appendChild(m);
          return m;
        })();
      meta.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
};

export default Title;