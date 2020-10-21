import React from "react";
import "./Marker.css";

const Marker = (props) => {
  // eslint-disable-next-line no-unused-vars
  const { color, name, id } = props;
  return (
    <div>
      <div
        className="pin bounce"
        style={{ backgroundColor: color, cursor: "pointer" }}
        title={name}
      />
      <div className="pulse" />
    </div>
  );
};

export default Marker;
