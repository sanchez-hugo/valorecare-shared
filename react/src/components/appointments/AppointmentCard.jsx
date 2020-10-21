import React from "react";
import PropTypes from "prop-types";
// import _logger from "sabio-debug";
// import Moment from "moment";
import {
  buildFullName,
  convertCostToString,
  buildDateTime,
  buildDateShort,
  getAppointmentStatus,
  getAppointmentStage,
} from "../../services/utilityService";
import profileIcon from "../../assets/images/users/yellow-profile-icon.png";

const AppointmentCard = (props) => {
  const ConfirmButton = () => {
    const handleConfirmClick = () => {
      props.onHandleConfirm(props.appointment);
    };

    return (
      <button
        className="btn btn-primary col-8 m-1"
        onClick={handleConfirmClick}
      >
        Confirm
      </button>
    );
  };

  const DeclineButton = () => {
    const handleDeclineClick = () => {
      props.onHandleDecline(props.appointment);
    };

    return (
      <button className="btn btn-danger col-8 m-1" onClick={handleDeclineClick}>
        Decline
      </button>
    );
  };

  const CancelButton = () => {
    const handleCancelClick = () => {
      props.onHandleCancel(props.appointment);
    };

    return (
      <button className="btn btn-danger col-8" onClick={handleCancelClick}>
        Cancel
      </button>
    );
  };

  const NoShowButton = () => {
    const handleNoShowClick = () => {
      props.onHandleNoShow(props.appointment);
    };

    return (
      <button className="btn btn-danger col-8" onClick={handleNoShowClick}>
        No Show
      </button>
    );
  };

  const MissedButton = () => {
    return (
      <button disabled className="btn btn-danger col-8">
        Missed
      </button>
    );
  };

  const CompletedButton = () => {
    return (
      <button disabled className="btn btn-success col-8">
        Completed
      </button>
    );
  };

  const ConfirmedButton = () => {
    return (
      <button disabled className="btn btn-success col-8">
        Confirmed
      </button>
    );
  };

  const CompleteButton = () => {
    const handleCompleteClick = () => {
      props.onHandleComplete(props.appointment);
    };

    return (
      <button className="btn btn-success col-8" onClick={handleCompleteClick}>
        Complete
      </button>
    );
  };

  const DeleteButton = () => {
    const handleDeleteClick = () => {
      props.onHandleDelete(props.appointment);
    };

    return (
      <button className="btn btn-danger col-8 m-1" onClick={handleDeleteClick}>
        Delete
      </button>
    );
  };

  const handleError = (e) => {
    e.target.src = profileIcon;
  };

  const startDate = buildDateShort(props.appointment.startTime);
  const endDate = buildDateShort(props.appointment.endTime);

  const startDateTime = buildDateTime(props.appointment.startTime);
  const endDateTime = buildDateTime(props.appointment.endTime);

  const SeekerButtons = () => {
    const isCancelled = props.appointment.isCancelled;
    if (isCancelled) return <DeleteButton />;
    else {
      const stage = getAppointmentStage(props.appointment);
      const status = getAppointmentStatus(props.appointment);
      if (stage === "before") {
        // Possible Status: Confirmed / Not Confirmed
        return <CancelButton />;
      } else if (stage === "during") {
        // Possible Status: In Progress
        return <NoShowButton />;
      } else if (stage === "after") {
        // Possible Status: Completed / Missed
        if (status === "Completed") return <CompletedButton />;
        else if (status === "Missed") return <MissedButton />;
        else return null;
      } else return null;
    }
  };

  const ProviderButtons = () => {
    const isCancelled = props.appointment.isCancelled;
    if (isCancelled) return <DeleteButton />;
    else {
      const stage = getAppointmentStage(props.appointment);
      const status = getAppointmentStatus(props.appointment);
      if (stage === "before") {
        // Possible Status: Confirmed / Not Confirmed
        if (status === "Confirmed") return <ConfirmedButton />;
        else if (status === "Not Confirmed")
          return (
            <div className="row justify-content-center">
              <ConfirmButton />
              <DeclineButton />
            </div>
          );
        else return null;
      } else if (stage === "during") {
        // Possible Status: In Progress
        if (status === "In Progress") return <CancelButton />;
        else return null;
      } else if (stage === "after") {
        // Possible Status: Completed / Missed
        if (status === "Completed") return <CompleteButton />;
        else if (status === "Missed")
          return (
            <div className="row justify-content-center">
              <MissedButton />
              <DeleteButton />
            </div>
          );
      } else return null;
    }
  };

  const Buttons = () => {
    if (props.isSeeker) return <SeekerButtons />;
    else return <ProviderButtons />;
  };

  const imageSrc = props.isSeeker
    ? props.appointment.provider.avatarUrl
    : props.appointment.seeker.avatarUrl;
  const user = props.isSeeker
    ? props.appointment.provider
    : props.appointment.seeker;
  const isCancelled = props.appointment.isCancelled;
  const isConfirmed = props.appointment.isConfirmed;
  const status = getAppointmentStatus(props.appointment);

  const handleMessage = () => {
    props.handleMessage(props.appointment);
  };

  return (
    <div
      className={props.isInDashboard ? "col-xl-6 p-3" : "col-md-6 col-lg-4 p-3"}
    >
      <div className="card h-100 px-3 pt-3 pb-1">
        <div className="card-body">
          <div className="row">
            <div className="col" style={{ width: "100%", height: "100%" }}>
              <img
                className="rounded-circle"
                alt="Profile Avatar"
                src={imageSrc}
                style={{ height: "100%", width: "100%", objectFit: "cover" }}
                onError={handleError}
              />
            </div>
            <div className="pl-3 col-8" style={{ textAlign: "left" }}>
              <div className="card-text text-center h3">
                {buildFullName(user)}
              </div>
              <div className="card-text text-center h5">
                {startDate === endDate
                  ? startDate
                  : `${startDate} - ${endDate}`}
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleMessage}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 pb-4 row">
            <div className="col">
              <h4>
                Start
                <br />
                <small>{startDateTime}</small>
              </h4>
            </div>
            <div
              className="col"
              style={{
                borderLeft: "thin solid rgb(204, 204, 204)",
              }}
            >
              <h4>
                End
                <br />
                <small>{endDateTime}</small>
              </h4>
            </div>
          </div>
          <div className="pt-4 pb-4 row">
            <div className="col">
              <h4>
                Total
                <br />
                <small>
                  {convertCostToString(props.appointment.price * 100)}
                </small>
              </h4>
            </div>
            <div
              className="col"
              style={{
                borderLeft: "thin solid rgb(204, 204, 204)",
              }}
            >
              <h4>
                Status
                <br />
                <small
                  className={
                    isCancelled
                      ? "text-danger"
                      : isConfirmed
                      ? "text-success"
                      : ""
                  }
                >
                  {status}
                </small>
              </h4>
            </div>
          </div>
        </div>
        <div className="my-0 pt-0 card-body row">
          <div className="col text-center">
            <Buttons />
          </div>
        </div>
      </div>
    </div>
  );
};

AppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    seeker: PropTypes.shape({
      userId: PropTypes.number,
      avatarUrl: PropTypes.string,
      firstName: PropTypes.string,
      mi: PropTypes.string,
      lastName: PropTypes.string,
    }).isRequired,
    provider: PropTypes.shape({
      userId: PropTypes.number,
      avatarUrl: PropTypes.string,
      firstName: PropTypes.string,
      mi: PropTypes.string,
      lastName: PropTypes.string,
    }),
    price: PropTypes.number,
    isConfirmed: PropTypes.bool,
    isCancelled: PropTypes.bool,
    id: PropTypes.number.isRequired,
    startTime: PropTypes.string.isRequired,
    endTime: PropTypes.string.isRequired,
  }),
  onHandleConfirm: PropTypes.func.isRequired,
  onHandleDecline: PropTypes.func.isRequired,
  onHandleNoShow: PropTypes.func.isRequired,
  onHandleCancel: PropTypes.func.isRequired,
  onHandleComplete: PropTypes.func.isRequired,
  onHandleDelete: PropTypes.func.isRequired,
  isSeeker: PropTypes.bool.isRequired,
  isInDashboard: PropTypes.bool.isRequired,
  handleMessage: PropTypes.func,
};
export default AppointmentCard;
