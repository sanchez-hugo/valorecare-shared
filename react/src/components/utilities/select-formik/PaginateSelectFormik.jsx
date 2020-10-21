import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { toastError } from "../../../services/utilityService";

class PaginateSelectFormik extends Component {
  state = { selectOptions: [] };

  componentDidMount() {
    this.fillOptions();
  }

  handleSelectChange = (option) => {
    const name = this.props.field.name;
    const value = option ? option.value : 0;

    this.props.form.setFieldValue(name, value);
  };

  handleBlur = () => {
    const name = this.props.field.name;
    this.props.form.setFieldValue(name, true);
  };

  fillOptions = () => {
    const pageIndex = 0;
    const pageSize = this.props.maxCount;

    this.props
      .getOptions(pageIndex, pageSize)
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

  findOption = (fieldValue) => {
    const foundOption = this.state.selectOptions.find((option) => {
      return option.value === fieldValue;
    });

    return foundOption;
  };

  render() {
    return (
      <Select
        {...this.props.field}
        {...this.props}
        inputId={this.props.field.name}
        placeholder={this.props.placeholder}
        value={
          this.props.field.value ? this.findOption(this.props.field.value) : 0
        }
        onChange={this.handleSelectChange}
        options={this.state.selectOptions}
        onBlur={this.handleBlur}
      />
    );
  }
}

export default PaginateSelectFormik;

PaginateSelectFormik.propTypes = {
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

PaginateSelectFormik.defaultProps = {
  maxCount: 10,
};
