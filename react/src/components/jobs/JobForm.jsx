import React, { PureComponent } from "react";
import { FormGroup, Label } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { SelectFormik } from "../utilities/select-formik/SelectFormik";
import PropTypes from "prop-types";
import Job from "./Job";
import { getById, updateById, add } from "../../services/jobService";
import { toastSuccess, toastError } from "../../services/utilityService";
import { getType } from "../../services/lookUpService";
import { getCreatedBy as getLocations } from "../../services/locationService";
import { buildAddress } from "../../services/utilityService";
import { jobFormSchema } from "../../schemas/jobValidationSchema";
import ToggleFormik from "../utilities/ToggleFormik";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./JobStyles.css";
import debug from "sabio-debug";
import SearchLocationFormik from "../utilities/select-formik/SearchLocationFormik";
const _logger = debug.extend("JobForm");

export default class JobForm extends PureComponent {
  state = {
    formData: {
      jobTypeId: 0,
      // locationId: 0,
      location: {},
      title: "",
      description: "",
      isActive: false,
      requirements: "",
    },
    job: {},
    locationOptions: [],
    jobTypeOptions: [],
    showLocationForm: true,
    formattedAddress: "",
    unFormattedAddress: "",
    stateTypeOptions: [],
  };

  componentDidMount() {
    this.getSelectOptions();
    this.getFilledForm();
  }

  getSelectOptions = () => {
    const optionsPageIndex = 0;
    const optionsPageSize = 10;

    getLocations(optionsPageIndex, optionsPageSize)
      .then(this.onGetOptionsSuccess)
      .then(this.setLocations)
      .catch(this.onGetOptionsError);

    const job = "JobType";
    getType(job)
      .then(this.onGetOptionsSuccess)
      .then(this.setJobTypes)
      .catch(this.onGetOptionsError);

    const state = "States";
    getType(state)
      .then(this.onGetOptionsSuccess)
      .then(this.setStateTypes)
      .catch(this.onGetOptionsError);
  };

  //#region Fill Form
  getFilledForm = () => {
    if (this.props.location && this.props.location.state) {
      // Pull job from provided data
      const job = this.props.location.state;
      this.setForm(job);
    } else {
      // Pull job from id if path is found
      if (this.props.location.pathname.includes("edit")) {
        const pathSections = this.props.location.pathname.split("/");
        const jobId = pathSections[2];
        this.getJobFromId(jobId);
      }
      // If no path, new form
      else toastSuccess("Adding a new job.");
    }
  };

  setForm = (job) => {
    // Verify if user created this job
    if (job.createdBy.userId === this.props.currentUser.id) {
      // If so fill job form
      const formattedAddress = buildAddress(job.jobLocation);
      const formData = this.extractFormData(job);
      this.setState((prevState) => ({
        ...prevState,
        formData,
        job,
        formattedAddress,
      }));
    } else {
      toastError("You do not have access to this job.");
      this.props.history.push("/jobs");
    }
  };

  getJobFromId = (jobId) => {
    getById(jobId)
      .then(this.onGetByIdSuccess)
      .then(this.setForm)
      .catch(this.onGetByIdError);
  };

  extractFormData = (job) => {
    const formData = { ...job };
    if (formData.createdBy) delete formData.createdBy;
    if (formData.dateCreated) delete formData.dateCreated;
    if (formData.dateModified) delete formData.dateModified;
    if (formData.jobLocation) {
      formData.location = formData.jobLocation;
      formData.location.stateId = formData.location.state.id;
      formData.location.locationTypeId = formData.location.locationType.id;

      delete formData.location.state;
      delete formData.location.locationType;
      delete formData.jobLocation;
    }
    if (formData.jobType) {
      formData.jobTypeId = formData.jobType.id;
      delete formData.jobType;
    }
    return formData;
  };
  //#endregion

  //#region On Click Handlers
  handleSubmit = (values, { resetForm, setSubmitting }) => {
    values.jobTypeId = Number(values.jobTypeId);
    values.locationId = Number(values.locationId);
    const formData = values;
    values.locationId = this.state.showLocationForm ? 0 : values.locationId;

    this.setState(
      (prevState) => ({ ...prevState, formData }),
      () => {
        this.state.formData.id
          ? this.handleUpdateClick({ setSubmitting })
          : this.handleAddClick({ resetForm });
      }
    );
  };

  handleUpdateClick = ({ setSubmitting }) => {
    const job = this.state.formData;
    if (job.dateCreated) delete job.dateCreated;
    if (job.dateModified) delete job.dateModified;
    if (job.createdBy) delete job.createdBy;
    // _logger(job);

    updateById(job)
      .then(this.onEditSuccess)
      .then(setSubmitting(false))
      .catch(this.onEditError);
  };

  handleAddClick = ({ resetForm }) => {
    // _logger(values);
    const job = this.state.formData;
    add(job).then(this.onAddSuccess).catch(this.onAddError);

    resetForm(this.state.formData);
  };

  handleBackClick = () => {
    this.props.history.goBack();
  };

  //#endregion

  //#region Success and Error Handlers
  onGetByIdSuccess = (response) => response.item;

  onGetByIdError = (response) => {
    const toastMsg = `Could not load job form. ${response.message}`;
    toastError(toastMsg);
  };

  onEditSuccess = () => {
    const job = this.state.formData;
    this.props.history.push(`/jobs/${job.id}/details`);
  };

  onEditError = (response) => {
    const toastMsg = `Could not update job. ${response.message}`;
    toastError(toastMsg);
  };

  onAddSuccess = (responseData) => {
    const jobId = responseData.item;
    this.props.history.push(`/jobs/${jobId}/details`);
  };

  onAddError = (response) => {
    const toastMsg = `Could not add job. ${response.message}`;
    toastError(toastMsg);
  };

  onGetOptionsSuccess = (response) => {
    if (response.item) {
      if (response.item.pagedItems) return response.item.pagedItems;
      else return response.item;
    } else if (response.items) return response.items;
    else return null;
  };
  setStateTypes = (stateTypes) => {
    const stateTypeOptions = stateTypes.map(this.mapJobTypes);
    this.setState((prevState) => ({ ...prevState, stateTypeOptions }));
  };
  onGetOptionsError = (response) => {
    _logger("error", response);
    // const toastError = `Failed to retrieve options: ${response.message}`;
    // toastError(toastError);
  };

  handleLocationError = () => {
    this.toggleShowLocationForm();
  };
  //#endregion

  //#region Location Stuff
  toggleShowLocationForm = () => {
    this.setState((prevState) => {
      return {
        ...prevState,
        formData: { ...prevState.formData, locationId: 0 },
        showLocationForm: !prevState.showLocationForm,
      };
    });
  };

  handleAddressUpdated = (response) => {
    _logger(response, "handleAddressUpdated");
    if (response.address_components) {
      const location = this.getAddressObj(
        response.address_components,
        response
      );
      let formattedAddress = response.formatted_address;
      //set state

      this.setState((prevState) => {
        return {
          ...prevState,
          formData: {
            ...prevState.formData,
            location,
          },
          formattedAddress,
        };
      });
    }
  };

  getAddressObj = (components, response) => {
    let address = {};
    Object.keys(components).forEach((key) => {
      address[components[key].types[0]] = components[key].long_name;
    });

    const location = {
      lineOne: address.street_number + " " + address.route,
      lineTwo: address.subpremise || "",
      city: address.locality || address.political,
      zip: address.postal_code || "",
      stateId: this.getStateId(address.administrative_area_level_1),
      latitude: response.geometry.location.lat(),
      longitude: response.geometry.location.lng(),
      locationTypeId: 1,
    };

    return location;
  };

  getStateId = (stateApprev) => {
    const stateList = [...this.state.stateTypeOptions];
    const stateObj = stateList.find((state) => {
      return state.label === stateApprev;
    });
    return stateObj.value;
  };

  allowAddressChange = () => {
    this.setState((prevState) => ({ ...prevState, formattedAddress: "" }));
  };

  setUnFormattedAddress = (unFormattedAddress) => {
    this.setState((prevState) => ({ ...prevState, unFormattedAddress }));
  };
  // Old Location Stuff
  setLocations = (locations) => {
    const locationOptions = locations.map(this.mapLocations);

    this.setState((prevState) => ({ ...prevState, locationOptions }));
  };

  mapLocations = (location) => {
    const locationOption = {
      value: location.id,
      label: buildAddress(location),
    };
    return locationOption;
  };
  //#endregion

  //#region Job Type Stuff
  setJobTypes = (jobTypes) => {
    const jobTypeOptions = jobTypes.map(this.mapJobTypes);
    this.setState((prevState) => ({ ...prevState, jobTypeOptions }));
  };

  mapJobTypes = (jobType) => {
    const jobTypeOption = {
      value: jobType.id,
      label: jobType.name,
    };
    return jobTypeOption;
  };
  //#endregion

  //#region Description / Requirement Stuff
  viewContent = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };
  //#endregion

  render() {
    const locationOptions = this.state.locationOptions;
    const jobTypeOptions = this.state.jobTypeOptions;

    return (
      <React.Fragment>
        <Formik
          enableReinitialize={true}
          validationSchema={jobFormSchema}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={this.state.formData}
          onSubmit={this.handleSubmit}
        >
          {(props) => {
            const {
              values,
              touched,
              errors,
              handleSubmit,
              isValid,
              isSubmitting,
              setFieldValue,
              setFieldTouched,
            } = props;
            return (
              <div className="container-fluid">
                <div className="row justify-content-center py-5 px-md-5">
                  <Form onSubmit={handleSubmit} className={"card p-4 col-md-7"}>
                    {/* <pre>{JSON.stringify(props, null, 3)}</pre> */}
                    {/* <pre>
                      {JSON.stringify({ values, isValid, errors }, null, 3)}
                    </pre> */}
                    <FormGroup>
                      <Label>
                        Location{" "}
                        <span>
                          {/* <button
                          type="button"
                          className="btn btn-success"
                          onClick={this.showLocationForm}
                        >
                          <i className="fas fa-search"></i>
                        </button>{" "} */}
                        </span>
                      </Label>
                      {this.state.showLocationForm ? (
                        this.state.formattedAddress === "" ? (
                          // <LocationSearchInput
                          //   getAddress={this.handleAddressUpdated}
                          // />
                          <>
                            <Field
                              key={"Location_Select"}
                              name="location"
                              component={SearchLocationFormik}
                              placeholder="What's the address for this job?"
                              getAddress={this.handleAddressUpdated}
                              updateAddress={this.setUnFormattedAddress}
                              currentAddress={this.state.unFormattedAddress}
                            />
                            {/* {errors.location && touched.location ? (
                              <div className="text-danger">
                                Please enter a location
                              </div>
                            ) : null} */}
                          </>
                        ) : (
                          <div className="row align-items-center">
                            <div className="col">
                              <input
                                type="text"
                                value={this.state.formattedAddress}
                                className=" form-control"
                                readOnly
                              />
                            </div>
                            <div className="col-2">
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={this.allowAddressChange}
                              >
                                <i className="fas fa-redo" />
                              </button>
                            </div>
                          </div>
                        )
                      ) : null}
                      {!this.state.showLocationForm && (
                        <>
                          <Field
                            key={"Location_Select"}
                            name="locationId"
                            component={SelectFormik}
                            placeholder="Select a location"
                            options={locationOptions}
                            mapOptions={this.mapLocations}
                            isClearable
                          />
                          <ErrorMessage
                            className="error"
                            component="div"
                            name="locationId"
                          />
                        </>
                      )}
                    </FormGroup>
                    <FormGroup>
                      <Label>Job Type</Label>
                      <Field
                        key={"JobType_Select"}
                        name="jobTypeId"
                        component={SelectFormik}
                        placeholder="Select a job type"
                        options={jobTypeOptions}
                        isSearchable
                        isClearable
                      />
                      <ErrorMessage
                        className="error"
                        component="div"
                        name="jobTypeId"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Title</Label>
                      <Field
                        name="title"
                        type="text"
                        values={values.title}
                        placeholder="Title"
                        className={
                          errors.title && touched.title
                            ? "form-control error is-invalid"
                            : "form-control"
                        }
                      />
                      <ErrorMessage
                        className="error"
                        component="div"
                        name="title"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Description</Label>
                      <CKEditor
                        onBlur={() => setFieldTouched("description", true)}
                        className="form-control"
                        editor={ClassicEditor}
                        onChange={(event, editor) =>
                          setFieldValue("description", editor.getData())
                        }
                        onInit={(editor) => editor.setData(values.description)}
                        data={values.description}
                      />{" "}
                      <style>
                        {`
                        .ck-content { height: 200px; }
                        `}
                      </style>
                      <ErrorMessage
                        name="description"
                        component="div"
                        className="error"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Requirements</Label>
                      <CKEditor
                        onBlur={() => setFieldTouched("requirements", true)}
                        className="form-control"
                        editor={ClassicEditor}
                        onChange={(event, editor) =>
                          setFieldValue("requirements", editor.getData())
                        }
                        onInit={(editor) => editor.setData(values.requirements)}
                        data={values.requirements}
                      />
                      <style>
                        {`
                        .ck-content { height: 200px; }
                        `}
                      </style>
                      <ErrorMessage
                        name="requirements"
                        component="div"
                        className="error"
                      />
                    </FormGroup>
                    <FormGroup>
                      <div className="row justify-content-between p-3">
                        <div className="">
                          <Label className="">Make this job active?</Label>
                        </div>
                        <div className="">
                          <Field
                            key={"Job_Toggle"}
                            name="isActive"
                            component={ToggleFormik}
                            className={
                              errors.isActive && touched.isActive
                                ? "form-control error"
                                : "form-control"
                            }
                          />
                        </div>
                      </div>
                      <ErrorMessage name="isActive" />
                    </FormGroup>
                    <div className="row justify-content-between p-3">
                      <button
                        type="button"
                        data-toggle="tooltip"
                        data-placement="bottom"
                        className="btn"
                        title="Back"
                        onClick={this.handleBackClick}
                      >
                        <i className="fas fa-arrow-left" />
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !isValid ||
                          isSubmitting ||
                          !this.state.formattedAddress
                        }
                        data-toggle="tooltip"
                        data-placement="bottom"
                        className="btn btn-success"
                        title={this.state.formData.id ? "Update" : "Add"}
                      >
                        {this.state.formData.id ? "Update" : "Add"}
                      </button>
                    </div>
                  </Form>
                  <div className="col-md-5">
                    <Job
                      job={values}
                      isEditing={true}
                      locationOptions={locationOptions}
                      currentUser={this.props.currentUser}
                      locationAddress={this.state.formattedAddress}
                    />
                  </div>
                </div>
              </div>
            );
          }}
        </Formik>
      </React.Fragment>
    );
  }
}

JobForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({ id: PropTypes.number }).isRequired,
};
