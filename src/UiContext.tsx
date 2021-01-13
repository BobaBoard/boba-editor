import React from "react";

const UiContext = React.createContext({
  showIconSelector: (props: { icons: string[] }) => <></>,
});

export default UiContext;
