import React from 'react';

export const BarLegend = () => (
  <span>
    <span
      style={{
        padding: "5px",        
        width: "45px",
        display: "inline-block",
        height: "25px",
        backgroundColor: "#0e7cee",
        color: "#fff",
      }}
    >
      JS
    </span>
    <span
      style={{
        padding: "5px",        
        width: "45px",
        display: "inline-block",
        height: "25px",
        backgroundColor: "#e07c14",
        color: "#fff",
      }}
    >
      CSS
    </span>
    <span>% Used</span>
  </span>
)