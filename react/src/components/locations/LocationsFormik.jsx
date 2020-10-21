import React from "react";
import debug from "sabio-debug";
import { FormGroup, Label, Button } from "reactstrap";
import { Formik, Field, Form, ErrorMessage } from "formik";
import PropTypes from "prop-types";
import LocationSearchInput from "./LocationSearchInput";
import { SelectFormik } from "../utilities/select-formik/SelectFormik";
import { getType } from "../../services/lookUpService";
import * as locationService from "../../services/locationService";
import LocationSchema from "./LocationValidationSchema";
import { withRouter } from "react-router-dom";

const _logger = debug.extend("LocationsForm");

class LocationsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        locationTypeId: "   ",
        lineOne: "",
        lineTwo: "",
        city: "",
        zip: "",
        stateId: "",
        latitude: "",
        longitude: "",
      },
      locationTypeOptions: [],
      stateTypeOptions: [],
      isEdit: false,
    };
  }

  componentDidMount() {
    _logger("component did mount");
    this.onGetById();
    this.getOptionTypes();
  }
  onGetById = () => {
    const { id } = this.props.match.params;
    if (id) {
      const { state } = this.props.location;
      _logger(state);
      if (state) {
        this.setForm(state);
      } else {
        locationService
          .getAll(id)
          .then(this.onGetByIdSuccess)
          .catch(this.onGetByIdError);
      }
    }
  };

  getOptionTypes = () => {
    const location = "LocationTypes";

    getType(location)
      .then(this.onGetOptionsSuccess)
      .then(this.setLocationTypes)
      .catch(this.onGetOptionsError);

    const state = "States";
    getType(state)
      .then(this.onGetOptionsSuccess)
      .then(this.setStateTypes)
      .catch(this.onGetOptionsError);
  };

  onGetOptionsSuccess = (response) => {
    if (response.item) {
      if (response.item.pagedItems) return response.item.pagedItems;
      else return response.item;
    } else if (response.items) return response.items;
    else return null;
  };

  onGetOptionsError = (response) => {
    _logger(response);
  };

  setLocationTypes = (locationTypes) => {
    const locationTypeOptions = locationTypes.map(this.mapOptionTypes);
    this.setState((prevState) => ({ ...prevState, locationTypeOptions }));
  };

  setStateTypes = (stateTypes) => {
    const stateTypeOptions = stateTypes.map(this.mapOptionTypes);
    this.setState((prevState) => ({ ...prevState, stateTypeOptions }));
  };
  mapOptionTypes = (optionType) => {
    const optionTypes = {
      value: optionType.id,
      label: optionType.name,
    };
    return optionTypes;
  };

  setForm = (formData) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        formData: {
          locationTypeId: formData.locationTypeId,
          lineOne: formData.lineOne,
          lineTwo: formData.lineTwo,
          city: formData.city,
          zip: formData.zip,
          stateId: formData.stateId,
          latitude: formData.latitude,
          longitude: formData.longitude,
          id: formData.id,
        },
        isEdit: true,
      };
    });
  };

  onGetByIdSuccess = (response) => {
    this.setForm(response.item);
  };
  onGetByIdError = (errResponse) => {
    _logger(errResponse, "GetById Error");
  };

  handleSubmit = (values) => {
    _logger("handleSubmit did mount");
    values.stateId = Number(values.stateId);
    values.locationTypeId = Number(values.locationTypeId);
    let onEditLocationsRequest = this.state.isEdit;

    if (onEditLocationsRequest) {
      locationService
        .update(values)
        .then(this.onEditSuccess)
        .catch(this.onEditError);
    } else {
      locationService
        .create(values)
        .then(this.addLocationSuccess)
        .catch(this.addLocationError);
    }
  };

  addLocationSuccess = (response) => {
    _logger(response);
    this.props.history.push("/locations");
  };
  addLocationError = (errResponse) => {
    _logger(errResponse, "Add Location Error");
  };
  onEditSuccess = (response) => {
    _logger(response.items);
    this.props.history.push("/locations");
  };
  onEditError = (errResponse) => {
    _logger(errResponse, "Update Location Error");
  };

  handleAddressUpdated = (response) => {
    _logger(response, "handleAddressUpdated");
    if (response.address_components) {
      let address = this.getAddressObj(response.address_components);

      //set state

      this.setState((prevState) => {
        return {
          ...prevState,
          formData: {
            ...prevState.formData,
            lineOne: address.street_number + "  " + address.route,
            lineTwo: address.administrative_area_level_2,
            city: address.locality,
            zip: address.postal_code,
            stateId: this.getStateId(address.administrative_area_level_1),
            latitude: response.geometry.location.lat(),
            longitude: response.geometry.location.lng(),
          },
        };
      });
    }
  };
  getStateId = (stateApprev) => {
    const stateList = [...this.state.stateTypeOptions];
    const stateObj = stateList.find((state) => {
      return state.label === stateApprev;
    });
    return stateObj.value;
  };
  onFullLocationChange = (locationObject) => {
    if (locationObject) {
      const locationStateShort = locationObject.addressObject.find(
        (x) => x.types[0] === "administrative_area_level_1"
      ).short_name;
      const locationStateName = locationObject.addressObject.find(
        (x) => x.types[0] === "administrative_area_level_1"
      ).long_name;
      const route = locationObject.addressObject.find(
        (x) => x.types[0] === "route"
      ).long_name;
      const streetNumber = locationObject.addressObject.find(
        (x) => x.types[0] === "street_number"
      ).long_name;
      const city = locationObject.addressObject.find(
        (x) => x.types[0] === "locality"
      ).long_name;
      const zip = locationObject.addressObject.find(
        (x) => x.types[0] === "postal_code"
      ).long_name;
      const lineOne = `${streetNumber} ${route}`;
      const locationStateId = this.getStateId(locationStateShort);
      const locationLong = locationObject.addressLong;
      const locationLat = locationObject.addressLat;
      this.setState(
        (prevState) => {
          return {
            ...prevState,
            formData: {
              ...prevState.formData,
              venueLocationId: 0,
              locationLineOne: lineOne,
              locationCity: city,
              locationStateId: locationStateId,
              locationStateName: locationStateName,
              locationZip: zip,
              // locationTypeId: e.location.locationType.id,
              locationLong: locationLong,
              locationLat: locationLat,
            },
          };
        },
        () => this.validate()
      );
    }
  };

  getAddressObj = (components) => {
    _logger(components, "getAddress Obj");
    let address = {};
    Object.keys(components).forEach((key) => {
      address[components[key].types[0]] = components[key].long_name;
    });
    _logger(address);

    return address;
  };

  render() {
    return (
      <Formik
        enableReinitialize={true}
        initialValues={this.state.formData}
        onSubmit={this.handleSubmit}
        validationSchema={LocationSchema}
      >
        {(props) => {
          const { values, touched, errors, isSubmitting, handleReset } = props;

          return (
            <Form className={"col-md-4 pt-6"}>
              <FormGroup>
                <label>Search Address</label>
                <LocationSearchInput getAddress={this.handleAddressUpdated} />
              </FormGroup>

              <FormGroup>
                <Label>Location</Label>
                <Field
                  as="select"
                  name="locationTypeId"
                  component={SelectFormik}
                  placeholder="Select a location"
                  options={this.state.locationTypeOptions}
                  isClearable
                />
                <ErrorMessage
                  className="error isInValid"
                  component="div"
                  name="locationId"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="lineOne">Address</Label>
                <Field
                  component="input"
                  name="lineOne"
                  values={values.lineOne}
                  className={
                    errors.lineOne && touched.lineOne
                      ? "form-control error isInValid"
                      : "form-control"
                  }
                />
                <ErrorMessage className="error" name="lineTwo" />
              </FormGroup>
              <FormGroup className="form-group">
                <Label htmlFor="city">City</Label>
                <Field
                  component="input"
                  name="city"
                  values={values.city}
                  id="city"
                  className={
                    errors.city && touched.city
                      ? "form-control error isInValid"
                      : "form-control"
                  }
                />
                <ErrorMessage className="error isInValid" name="city" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="zip">Zip</Label>
                <Field
                  component="input"
                  name="zip"
                  values={values.zip}
                  id="zip"
                  className={
                    errors.zip && touched.zip
                      ? "form-control error isInValid"
                      : "form-control"
                  }
                />
                <ErrorMessage className="error isInValid" name="zip" />
              </FormGroup>

              <FormGroup>
                <Label>State Id</Label>
                <Field
                  key={"States_SelectAll"}
                  name="stateId"
                  component={SelectFormik}
                  placeholder="Select a State"
                  options={this.state.stateTypeOptions}
                  isClearable
                />
                <ErrorMessage
                  className="error"
                  component="div"
                  name="stateId"
                />
              </FormGroup>
              {/* <FormGroup className="form-group">
                <Label htmlFor="latitude">latitude</Label>
                <Field
                  component="input"
                  name="latitude"
                  values={values.latitude}
                  id="latitude"
                  className={
                    errors.stateId && touched.latitude
                      ? "form-control error"
                      : "form-control"
                  }
                />
                <ErrorMessage className="error" name="latitude" />
              </FormGroup>

              <FormGroup className="form-group">
                <Label htmlFor="longitude">longitude</Label>
                <Field
                  component="input"
                  name="longitude"
                  values={values.longitude}
                  id="longitude"
                  className={
                    errors.stateId && touched.longitude
                      ? "form-control error"
                      : "form-control"
                  }
                />
                <ErrorMessage className="error" name="longitude" />
              </FormGroup> */}
              <FormGroup className="btn-group" role="group">
                <Button type="submit" disabled={isSubmitting}>
                  {this.state.isEdit ? "Update" : "Submit"}
                </Button>
                <Button
                  type="button"
                  name="cancelForm"
                  onClick={handleReset}
                  className="btn btn-default btn-sm"
                >
                  Reset
                </Button>
              </FormGroup>
            </Form>
          );
        }}
      </Formik>
    );
  }
}
LocationsForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      locationTypeId: PropTypes.number,
      stateId: PropTypes.number,
      lineOne: PropTypes.string,
      lineTwo: PropTypes.string,
      city: PropTypes.string,
      zip: PropTypes.string,
      longitude: PropTypes.number,
      latitude: PropTypes.number,
    }),
  }),
  onEditLocationsRequest: PropTypes.func,
  addNotification: PropTypes.func,
  //onDelete: PropTypes.func,
  onCancel: PropTypes.func,
  notify: PropTypes.func,
  history: PropTypes.shape({ push: PropTypes.func }),
};
export default withRouter(LocationsForm);
