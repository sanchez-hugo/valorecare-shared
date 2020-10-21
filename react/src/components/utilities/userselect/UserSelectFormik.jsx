import React, { Component } from "react";
import PropTypes from "prop-types";
import AsyncSelect from "react-select/async";
import * as userProfileService from "../../../services/userProfileService";

export default class UserSelectFormik extends Component {
  handleSelectChange = (option) => {
    if (option) {
      const value = option ? option.value : 0;
      this.props.form.handleChange(this.props.field.name)(value);
    }
  };
  loadOptions = (inputValue) => {
    const mappedOptions = userProfileService
      .searchUserProfile(0, 10, inputValue)
      .then(this.mapResponseToOptions)
      .catch(this.onError);
    return mappedOptions;
  };
  filterOptions = (inputValue) => {
    this.getOptions();
    return this.state.selectOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };
  mapResponseToOptions = (response) => {
    let mappedOptions = [];
    if (response.item.pagedItems.length > 0) {
      mappedOptions = response.item.pagedItems.map((user) => {
        return {
          label: `${user.firstName} ${user.lastName}`,
          value: parseInt(user.userId),
          ...user,
        };
      });
    }
    return mappedOptions;
  };
  onError = (error) => {
    if (error.response.status === 404) {
    } else {
      this.props.onError(error);
    }
  };
  handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    return inputValue;
  };
  render() {
    return (
      <AsyncSelect
        cacheOptions
        loadOptions={this.loadOptions}
        defaultOptions={false}
        isClearable
        escapeClearsValue
        onInputChange={this.handleInputChange}
        onChange={this.handleSelectChange}
        placeholder="Search Users"
        inputId={this.props.field.name}
        {...this.props}
      />
    );
  }
}
UserSelectFormik.propTypes = {
  field: PropTypes.shape({
    value: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    handleChange: PropTypes.func,
    values: PropTypes.any,
  }).isRequired,
  defaultOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  onError: PropTypes.func,
};
