import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { getById } from "../../services/jobService";
import { toastError } from "../../services/utilityService";
import { buildCityState, buildFullName } from "../../services/utilityService";
import profileIcon from "../../assets/images/users/yellow-profile-icon.png";
import PdfDownload from "../pdf/PdfDownload";
import { reachOut } from "../../services/appointmentService";
import debug from "sabio-debug";
import AppointmentEmailModal from "../appointments/AppointmentEmailModal";
import PreviewMapGeneral from "../utilities/maps/PreviewMapGeneral";
const _logger = debug.extend("JobDetail");

class JobDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      job: {
        id: 0,
        createdBy: {
          userId: 0,
          firstName: "",
          lastName: "",
        },
        jobType: {
          id: 0,
          name: "",
        },
        jobLocation: {
          id: 0,
          locationType: {
            id: 0,
            name: "",
          },
          lineOne: "",
          lineTwo: "",
          city: "",
          zip: "",
          state: {
            id: 0,
            name: "",
          },
          latitude: 0.0,
          longitude: 0.0,
          dateAddded: "",
          dateModified: "",
          createdBy: {
            userId: 0,
            firstName: "",
            lastName: "",
          },
        },
        locationId: 0,
      },
    };
  }

  componentDidMount() {
    if (this.props.location && this.props.location.state) {
      const job = this.props.location.state.job;
      this.setJob(job);
    } else {
      const jobId = this.props.location.pathname.split("/");
      getById(jobId[2]).then(this.onGetByIdSuccess).catch(this.onGetByIdError);
    }
  }

  setJob = (job) => {
    this.setState((prevState) => ({ ...prevState, job }));
  };

  onGetByIdSuccess = (data) => {
    this.setJob(data.item);
  };

  onGetByIdError = (response) => {
    const msg = `Job not found. ${response.message}`;
    toastError(msg);
  };

  handleBackClick = () => {
    // if seeker, push to all their jobs
    if (this.props.currentUser.roles.includes("Seeker"))
      this.props.history.push(`/jobs`);
    // if provider, push to browse jobs nearby
    else {
      if (
        this.props.location.state &&
        this.props.location.state.nearby &&
        this.props.location.state.nearby.radius
      )
        this.props.history.push(`/jobs`, this.props.location.state.nearby);
      else this.props.history.push(`/jobs/nearby`);
    }
  };

  handleEditClick = () => {
    const job = this.state.job;

    if (job.id) this.props.history.push(`/jobs/${job.id}/edit`, job);
  };

  // handleMessageClick2 = () => {
  //   if (this.props.currentUser.roles.includes("Subscribed")) {
  //     this.props.history.push(`/messages`);
  //   } else {
  //     return null;
  //   }
  // };

  handleMessageClick = () => {
    if (this.props.currentUser.roles.includes("Subscribed")) {
      this.props.history.push(`/messages/${this.state.job.createdBy.userId}`);
    }
  };

  handleEmailClick = () => {
    this.toggleModal(this.state.job.createdBy.userId);
  };

  toggleModal = (senderId) => {
    this.setState((prevState) => {
      return {
        isOpen: !prevState.isOpen,
        senderId,
      };
    });
  };

  sendEmail = (values) => {
    _logger(values, this.state.providerId);
    values.senderId = this.state.senderId;
    reachOut(values).then(this.onEmailSuccess).catch(this.onEmailError);
  };

  onEmailSuccess = (res) => {
    _logger(res);
    this.toggleModal(0);
  };

  onEmailError = (res) => {
    _logger(res);
    this.toggleModal(0);
  };

  handleError = (e) => {
    if (e.target.src !== this.state.job.createdBy.avatarUrl) {
      e.target.src = profileIcon;
    }
  };

  viewContent = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  render() {
    const dateNow = new Date().getTime();
    const dateAdded = new Date(this.state.job.dateCreated).getTime();
    const dateUpdated = new Date(this.state.job.dateModified).getTime();

    const msToDays = 86400000; // 3600 * 1000 * 24
    const daysSinceAdded = Math.floor((dateNow - dateAdded) / msToDays);
    const daysSinceUpdated = Math.floor((dateNow - dateUpdated) / msToDays);

    const jobUserId = this.state.job.createdBy.userId;
    const currentUserId = this.props.currentUser.id;
    const isJobOwner = jobUserId === currentUserId;

    const jobAddress =
      buildCityState(this.state.job.jobLocation) || "No Location Found";

    const isSubscribed = this.props.currentUser.roles.includes("Subscribed");
    const { latitude, longitude } = this.state.job.jobLocation;

    return (
      <div className="container-fluid px-md-5">
        <div className="px-md-5">
          <div className="card p-3 shadow-light lg">
            <div className="card-body py-0 row justify-content-left">
              <div
                className="mr-auto btn btn-lg"
                onClick={this.handleBackClick}
              >
                <i className="fas fa-arrow-left" /> All Jobs
              </div>
            </div>
            <div className="card-body py-0 row align-items-center">
              <div className="col-lg-8">
                <h1 className="mb-2 text-capitalize display-7">
                  {`${this.state.job.title}`}
                </h1>
                <h1 className="mb-2 text-capitalize display-7">
                  {`By ${buildFullName(this.state.job.createdBy)}`}
                </h1>
                <div className="mb-2 text-capitalize text-muted">
                  <small>
                    {jobAddress}
                    {" · "}
                    {this.state.job.jobType.name}
                    {" · "}
                    {this.state.job.isActive ? "Active" : "Not Active"}
                  </small>
                </div>
              </div>
              <div className="col-lg-4">
                {isJobOwner ? (
                  <button
                    type="button"
                    className="btn btn-primary col-lg-8"
                    onClick={this.handleEditClick}
                  >
                    Edit
                  </button>
                ) : (
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-primary col-lg-8"
                      onClick={this.handleEmailClick}
                    >
                      <i className="far fa-envelope" /> Email
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary col-lg-8"
                      onClick={this.handleMessageClick}
                      disabled={!isSubscribed}
                    >
                      <i className="fas fa-comment-alt" /> Message
                    </button>

                    {isSubscribed ? null : (
                      <div className="p-2 text-left text-muted">
                        <small>
                          Please consider <a href="/subscribe">subscribing</a>{" "}
                          if you&apos;d like to send direct messages.
                        </small>
                      </div>
                    )}
                  </div>
                )}
                {this.state.isOpen && (
                  <AppointmentEmailModal
                    isOpen={this.state.isOpen}
                    toggleModal={this.toggleModal}
                    sendEmail={this.sendEmail}
                  />
                )}
              </div>
            </div>
            <div className="row my-3">
              <div className="col-12">
                <hr />
              </div>
            </div>
            <div className="card-body row">
              <div className="col-xl-8">
                <h1 className="display-7">Description</h1>
                <div className="mb-4 px-2 spacing">
                  {this.viewContent(this.state.job.description)}
                </div>
                <h1 className="display-7">Requirements</h1>
                <div className="mb-4 px-2 spacing">
                  {this.viewContent(this.state.job.requirements)}
                </div>
              </div>
              <div className="col-xl-4">
                <div className="card shadow mb-4">
                  {longitude && latitude ? (
                    <PreviewMapGeneral
                      location={{
                        latitude,
                        longitude,
                      }}
                      isAddressHidden={true}
                    />
                  ) : null}
                  <div className="card-header text-center">{jobAddress}</div>
                </div>
                <div className="card shadow mb-4">
                  <div className="card-header">
                    <div className="card-text">{`Updated ${
                      daysSinceUpdated > 0
                        ? `${daysSinceUpdated} days ago`
                        : "today"
                    }`}</div>
                  </div>
                </div>
                <div className="card shadow mb-4">
                  <div className="card-header">
                    <div className="card-text">{`Added ${
                      daysSinceAdded > 0
                        ? `${daysSinceAdded} days ago`
                        : "today"
                    }`}</div>
                  </div>
                </div>
                {this.props.currentUser.roles.includes("Provider") && (
                  <div className="card shadow">
                    <PdfDownload
                      renderType="jobsDetail"
                      pdfData={this.state.job}
                      fileName="JobDetails"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

JobDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
    pathname: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default JobDetails;
