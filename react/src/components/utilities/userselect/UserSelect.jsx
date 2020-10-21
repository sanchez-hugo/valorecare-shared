import React, { Component } from "react";
import AsyncSelect from "react-select/async";
import PropTypes from "prop-types";
import * as userProfileService from "../../../services/userProfileService";
import Option from "./Option";

export default class UserSelect extends Component {
  mapResponseToOptions = (response) => {
    let mappedOptions = [];
    if (response.item.pagedItems.length > 0) {
      mappedOptions = response.item.pagedItems.map((user) => {
        return {
          value: user.userId,
          label: `${user.firstName} ${user.lastName}`,
          user: user,
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

  loadOptions = (inputValue) => {
    const mappedOptions = userProfileService
      .searchUserProfile(0, 10, inputValue)
      .then(this.mapResponseToOptions)
      .catch(this.onError);
    return mappedOptions;
  };

  handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    return inputValue;
  };

  onChange = (option) => {
    if (option) {
      this.props.onChange(option);
    }
  };

  render() {
    return (
      <AsyncSelect
        name="userSelect"
        cacheOptions
        loadOptions={this.loadOptions}
        isClearable
        onChange={this.onChange}
        defaultOptions={false}
        isSearchable
        onInputChange={this.handleInputChange}
        escapeClearsValue
        placeholder="Search Users"
        components={{ Option }}
      />
    );
  }
}

UserSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};
