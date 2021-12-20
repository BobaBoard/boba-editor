import React from "react";
import spinnerStyle from "./css/Spinner.module.css";

let color = "#ff5252";

const Spinner: React.FC<{
  width?: number;
  margin?: number;
}> = (props) => {
  let width = props.width || 40;
  let margin = props.margin || width / 10;
  const spinnerProperties = {
    width: `${width - margin * 2}px`,
    height: `${width - margin * 2}px`,
    margin: `${margin}px`,
    border: `${margin}px solid ${color}`,
    borderColor: `${color} transparent transparent transparent`,
  };

  return (
    <>
      <div
        className={spinnerStyle["lds-ring"]}
        style={{ width: `${width}px`, height: `${width}px` }}
      >
        <div style={spinnerProperties}></div>
        <div style={spinnerProperties}></div>
        <div style={spinnerProperties}></div>
        <div style={spinnerProperties}></div>
      </div>
    </>
  );
};

export default Spinner;
