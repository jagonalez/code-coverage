import React from 'react';

export const Bar = ({ original }) => (
  <div
    style={{
      width: "100%",
      height: "25px",
      backgroundColor: "#eaeaea",
    }}
  >
    <span
      style={{
        width: `${original.jsUsedPercent}%`,
        height: "25px",
        backgroundColor: "#0e7cee",
        transition: "all 0.2s ease-out",
        float: "left",
      }}
    />
    <span
      style={{
        width: `${original.cssUsedPercent}%`,
        height: "25px",
        backgroundColor: "#e07c14",
        transition: "all 0.2s ease-out",
        float: "left",
      }}
    />
    

  </div>
);