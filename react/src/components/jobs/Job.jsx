import React from "react";
import {
  truncateText,
  buildFullName,
  buildDateShort,
  buildCityState,
} from "../../services/utilityService";
import PropTypes from "prop-types";
import profileIcon from "../../assets/images/brand/Valorecare_logo symbol ONLY.png";

export default function Job({
  job,
  userId,
  history,
  isEditing,
  handleDeleteJob,
  // locationOptions,
  currentUser,
  location,
  ...props
}) {
  // isEditing - determines if currently in job form and not browsing

  //#region Card Areas
  const ImageField = () => {
    let imageSrc = "";
    if (job.createdBy) imageSrc = job.createdBy.avatarUrl;
    else imageSrc = currentUser.avatarUrl;

    const handleError = (e) => {
      if (e.target.src !== imageSrc) {
        e.target.src = profileIcon;
      }
    };

    return (
      <img
        className="card-img rounded-circle"
        style={{ width: "75%" }}
        src={imageSrc}
        alt={job.title}
        onError={handleError}
      />
    );
  };

  const TitleField = () => {
    return (
      <div className="card-title text-center font-weight-light h4">
        {truncateText(job.title, 30)}
      </div>
    );
  };

  const NameField = () => {
    let name = "";
    if (job.createdBy) name = buildFullName(job.createdBy);
    else if (currentUser) name = buildFullName(currentUser);
    else name = "No Name Provided";

    return (
      <div className="card-subtitle text-center font-weight-light h-5 mt-2">
        {`By ${truncateText(name, 20)}`}
      </div>
    );
  };

  const LocationField = () => {
    //#region Old Location Stuff
    // const findOption = (value, options) => {
    //   const foundOption = options.find((option) => {
    //     return option.value === value;
    //   });

    //   return foundOption;
    // };

    // const trimLocation = (addressString) => {
    //   const address = addressString.trim();

    //   const arrayOfAddress = address.split(",");
    //   const length = arrayOfAddress.length;

    //   const stateAndZip = arrayOfAddress[length - 1].trim();
    //   const addressCity = arrayOfAddress[length - 2].trim();

    //   const arrayOfStateAndZip = stateAndZip.split(" ");
    //   const addressState = arrayOfStateAndZip[0];

    //   return `${addressCity}, ${addressState}`;
    // };
    //#endregion

    const trimLocation = (addressString) => {
      const address = addressString.trim();

      const arrayOfAddress = address.split(",");

      const city = arrayOfAddress[1];

      const stateAndZipArray = arrayOfAddress[2].split(" ");
      stateAndZipArray.pop(stateAndZipArray - 1);
      const state = stateAndZipArray.join(" ");

      return `${city}, ${state}`;
    };

    if (isEditing) {
      return (
        <small>
          <i className="far fa-map" />{" "}
          {props.locationAddress
            ? trimLocation(props.locationAddress)
            : "Your City, State"}
        </small>
      );
    } else
      return (
        <small>
          <i className="far fa-map" />
          {` `}
          {buildCityState(job.jobLocation)}
        </small>
      );
  };

  const DateField = () => {
    // isEditing means you're in the form version
    return (
      <small>
        <i className="far fa-clock" />{" "}
        {isEditing
          ? new Date().toDateString()
          : buildDateShort(job.dateModified)}
      </small>
    );
  };

  const DisplayUserOptions = () => {
    if (!isEditing && userId) {
      if (userId === job.createdBy.userId) {
        return (
          <>
            <button
              type="button"
              className="col-xl-6 btn btn-sm btn-primary text-center m-2"
              onClick={handleDetails}
              style={{ whiteSpace: "normal" }}
            >
              View More
            </button>
            <button
              type="button"
              className="col btn btn-sm btn-outline-primary m-2"
              onClick={handleEdit}
            >
              <i className="fas fa-edit" />
            </button>
            <button
              type="button"
              className="col btn btn-sm btn-outline-danger m-2"
              onClick={handleDelete}
            >
              <i className="fas fa-trash-alt" />
            </button>
          </>
        );
      } else {
        return (
          <button
            type="button"
            className="btn btn-primary m-2"
            onClick={handleDetails}
          >
            View More
          </button>
        );
      }
    } else
      return (
        <button type="button" className="btn btn-primary m-2" disabled>
          View More
        </button>
      );
  };
  //#endregion

  //#region Click Handlers
  const handleDetails = () => {
    let nearby = {};
    if (location && location.state) {
      nearby = { ...location.state };
    }
    const details = { nearby, job };
    history.push(`/jobs/${job.id}/details`, details);
  };

  const handleEdit = () => {
    history.push(`/jobs/${job.id}/edit`, job);
  };

  const handleDelete = () => {
    handleDeleteJob(job.id);
  };
  //#endregion

  //#region Card
  return (
    <div
      id={job.id}
      className={!isEditing ? "col-sm-12 col-md-6 col-lg-4 p-3" : "p-1"}
    >
      <div className="card h-100">
        <div className="card-body pt-3 pb-0">
          <div className="row justify-content-center">
            <div className="col-xl-4 col-6">
              <ImageField />
            </div>
            <div className="col-xl-8">
              <TitleField />
              <NameField />
            </div>
          </div>
        </div>
        <div className="card-body py-0">
          <div className="card-text font-weight-light text-secondary">
            <LocationField />
          </div>

          <div className="card-text font-weight-light text-secondary">
            <DateField />
          </div>
        </div>
        <div className="card-footer">
          <div className="row justify-content-center">
            <DisplayUserOptions />
          </div>
        </div>
      </div>
    </div>
  );
  //#endregion
}

Job.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.number,
    createdBy: PropTypes.shape({
      userId: PropTypes.number,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      mi: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
    jobType: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
    jobLocation: PropTypes.shape({
      id: PropTypes.number,
      locationType: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
      lineOne: PropTypes.string,
      lineTwo: PropTypes.string,
      city: PropTypes.string,
      zip: PropTypes.string,
      state: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      dateAdded: PropTypes.string,
      dateModified: PropTypes.string,
      createdBy: PropTypes.shape({
        userId: PropTypes.number,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
      }),
    }),
    locationId: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    requirements: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    dateCreated: PropTypes.string,
    dateModified: PropTypes.string,
  }).isRequired,
  locationAddress: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    state: PropTypes.object,
    pathname: PropTypes.string,
  }),
  userId: PropTypes.number,
  isEditing: PropTypes.bool.isRequired,
  handleDeleteJob: PropTypes.func,
  locationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    })
  ),
  currentUser: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
};
