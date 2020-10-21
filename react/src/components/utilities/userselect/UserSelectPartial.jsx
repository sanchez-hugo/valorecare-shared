import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

const UserSelectPartial = ({ userOptions, onUserSelect }) => {
  const onSelectChange = (option) => {
    if (option) onUserSelect(option);
  };

  return (
    <Select
      options={userOptions}
      onChange={onSelectChange}
      placeholder="Select a user..."
      escapeClearsValue
      isSearchable
    />
  );
};

UserSelectPartial.propTypes = {
  userOptions: PropTypes.instanceOf(Array).isRequired,
  onUserSelect: PropTypes.func.isRequired,
};

export default UserSelectPartial;
