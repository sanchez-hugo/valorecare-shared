import React from "react";
import PropTypes from "prop-types";
import Toggle from "react-toggle";
import "react-toggle/style.css";

const ToggleFormik = ({ form, field }) => {
  const handleChange = (e) => {
    const target = e.target;
    const value = target.checked;
    form.setFieldValue(field.name, value);
  };

  return <Toggle onChange={handleChange} checked={field.value} />;
};

ToggleFormik.propTypes = {
  field: PropTypes.shape({
    value: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
};

export default ToggleFormik;
