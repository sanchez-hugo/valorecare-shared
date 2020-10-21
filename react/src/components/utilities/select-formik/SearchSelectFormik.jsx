import React, { Component } from "react";
import PropTypes from "prop-types";
import AsyncSelect from "react-select/async";
import { toastError } from "../../../services/utilityService";

class SearchSelectFormik extends Component {
  state = { inputValue: "", selectOptions: [] };

  handleSelectChange = (option) => {
    const name = this.props.field.name;
    const value = option ? option.value : 0;

    this.props.form.setFieldValue(name, value);
  };

  handleBlur = () => {
    const name = this.props.field.name;
    this.props.form.setFieldTouched(name, true);
  };

  fillOptions = () => {
    const query = this.state.inputValue;
    const pageIndex = 0;
    const pageSize = this.props.maxCount;

    this.props
      .getOptions(query, pageIndex, pageSize)
      .then(this.onGetOptionsSuccess)
      .then(this.setOptions)
      .catch(this.onGetOptionsError);
  };

  onGetOptionsSuccess = (response) => {
    if (response.item) {
      if (response.item.pagedItems) return response.item.pagedItems;
      else return response.item;
    } else if (response.items) return response.items;
    else return response;
  };

  onGetOptionsError = (response) => {
    const msg = `Failed to retrieve options: ${response.message}`;
    toastError(msg);
  };

  setOptions = (response) => {
    const selectOptions = response.map(this.props.mapOptions);

    this.setState((prevState) => ({ ...prevState, selectOptions }));
  };

  loadOptions = (inputValue, callback) => {
    this.fillOptions();

    setTimeout(() => {
      callback(this.filterOptions(inputValue));
    }, 1000);
  };

  filterOptions = (inputValue) => {
    return this.state.selectOptions.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, "");
    this.setState({ inputValue });
    return inputValue;
  };

  findOption = (fieldValue) => {
    const foundOption = this.state.selectOptions.find((option) => {
      return option.value === fieldValue;
    });

    return foundOption;
  };

  render() {
    return (
      <AsyncSelect
        {...this.props}
        {...this.props.field}
        inputId={this.props.field.name}
        placeholder={this.props.placeholder}
        value={
          this.props.field.value ? this.findOption(this.props.field.value) : 0
        }
        onChange={this.handleSelectChange}
        loadOptions={this.loadOptions}
        onInputChange={this.handleInputChange}
        options={this.state.selectOptions}
        onBlur={this.handleBlur}
      />
    );
  }
}

export default SearchSelectFormik;

SearchSelectFormik.propTypes = {
  field: PropTypes.shape({
    value: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func.isRequired,
  }).isRequired,
  placeholder: PropTypes.string.isRequired,
  getOptions: PropTypes.func.isRequired,
  mapOptions: PropTypes.func.isRequired,
  maxCount: PropTypes.number,
};

SearchSelectFormik.defaultProps = {
  maxCount: 10,
};
