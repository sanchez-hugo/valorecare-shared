import React from "react";
import PropTypes from "prop-types";
import "./MarkerPin.css";

const MarkerPin = (props) => {
  const { isAddressHidden, color, name } = props;

  if (isAddressHidden) return <div className="ring"></div>;
  else
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

MarkerPin.propTypes = {
  color: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isAddressHidden: PropTypes.bool.isRequired,
};

MarkerPin.defaultProps = {
  isAddressHidden: false,
  color: "red",
  name: "location",
};

export default MarkerPin;
