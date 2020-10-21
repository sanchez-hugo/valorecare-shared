import React, { PureComponent } from "react";
import logger from "sabio-debug";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import {
  getProviderAppointments,
  getProviderConfirmedAppointments,
  getProviderCancelledAppointments,
  getProviderUsers,
  getSeekerAppointments,
  getSeekerConfirmedAppointments,
  getSeekerCancelledAppointments,
  getSeekerUsers,
  update,
  deleteById,
  reachOut,
  getSeekerUserAppointments,
  getProviderUserAppointments,
} from "../../services/appointmentService";
import AppointmentCard from "./AppointmentCard";
import Pagination from "rc-pagination";
import "rc-pagination/assets/index.css";
import PropTypes from "prop-types";
import AppointmentEmailModal from "./AppointmentEmailModal";
import {
  toastSuccess,
  toastWarn,
  toastError,
  isRoleOf,
  swalConfirm,
  buildFullName,
} from "../../services/utilityService";
import {
  refundCharge as cancelAppointment,
  getAccountId,
  STRIPE_CLIENT_KEY,
  transferCharge,
} from "../../services/connectService";
import UserSelectPartial from "../utilities/userselect/UserSelectPartial";

const _logger = logger.extend("appointments");
const clientKey = STRIPE_CLIENT_KEY;
const clientState = "CHECK_USER";

class Appointments extends PureComponent {
  state = {
    accountId: "",
    listOfAppointments: [],
    isConfirmed: false,
    isSeeker: isRoleOf(this.props.currentUser.roles, "Seeker"),
    isOpen: false,
    dropDown: {
      isOpen: false,
      showAll: true,
      showConfirmed: false,
      showCancelled: false,
      showByUser: false,
      errorMessage: "No appointments, yet.",
    },
    pagination: {
      totalCount: 0,
      currentPage: 1,
      pageIndex: 0,
      pageSize: this.props.isInDashboard ? 4 : 9,
    },
    search: {
      currentUserId: 0,
      usersFound: false,
      userOptions: [],
    },
  };

  componentDidMount() {
    this.getUserOptions();
    this.getConnectAccount();
  }

  getConnectAccount = () => {
    if (!this.state.isSeeker)
      getAccountId()
        .then(this.onGetAccountSuccess)
        .catch(this.onGetAccountError);
    else this.getAppointments();
  };

  getUserOptions = () => {
    const isSeeker = this.state.isSeeker;
    if (isSeeker)
      getSeekerUsers()
        .then(this.onGetUsersSuccess)
        .then(this.setUserOptions)
        .catch(this.onGetUsersError);
    else
      getProviderUsers()
        .then(this.onGetUsersSuccess)
        .then(this.setUserOptions)
        .catch(this.onGetUsersError);
  };

  getAppointments = () => {
    const pageIndex = this.state.pagination.pageIndex;
    const pageSize = this.state.pagination.pageSize;
    const isSeeker = this.state.isSeeker;

    if (isSeeker) {
      getSeekerAppointments(pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    } else {
      getProviderAppointments(pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    }
  };

  getConfirmedAppointments = () => {
    const pageIndex = this.state.pagination.pageIndex;
    const pageSize = this.state.pagination.pageSize;
    const isSeeker = this.state.isSeeker;

    if (isSeeker) {
      getSeekerConfirmedAppointments(pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    } else {
      getProviderConfirmedAppointments(pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    }
  };

  getCancelledAppointments = () => {
    const pageIndex = this.state.pagination.pageIndex;
    const pageSize = this.state.pagination.pageSize;
    const isSeeker = this.state.isSeeker;

    if (isSeeker) {
      getSeekerCancelledAppointments(pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    } else {
      getProviderCancelledAppointments(pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    }
  };

  getUserAppointments = (id) => {
    const pageIndex = this.state.pagination.pageIndex;
    const pageSize = this.state.pagination.pageSize;
    const isSeeker = this.state.isSeeker;

    if (isSeeker) {
      getSeekerUserAppointments(id, pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    } else {
      getProviderUserAppointments(id, pageIndex, pageSize)
        .then(this.onGetAppointmentsSuccess)
        .catch(this.onGetAppointmentsError);
    }
  };

  //#region Email / Message
  handleMessage = (appointment) => {
    if (this.props.currentUser.roles.includes("Subscribed")) {
      if (this.props.currentUser.roles.includes("Provider")) {
        this.props.history.push(`/messages/${appointment.seeker.userId}`);
      } else {
        this.props.history.push(`/messages/${appointment.provider.userId}`);
      }
    } else {
      if (this.props.currentUser.roles.includes("Provider")) {
        this.toggleModal(appointment.seeker.userId);
      } else {
        this.toggleModal(appointment.provider.userId);
      }
    }
  };

  toggleModal = (senderId) => {
    this.setState((prevState) => {
      return {
        isOpen: !prevState.isOpen,
        senderId, //here we flip the bool value of the previous state.
      };
    });
  };

  sendEmail = (values) => {
    _logger(values, this.state.providerId);
    values.senderId = this.state.senderId;
    reachOut(values).then(this.onEmailSuccess).catch(this.onEmailError);
  };
  //#endregion

  //#region Management
  setUserOptions = (listOfUsers) => {
    const userOptions = listOfUsers.map(this.mapUsers);
    this.setState((prevState) => ({
      ...prevState,
      search: { ...prevState.search, userOptions },
    }));
  };

  mapUsers = (user) => {
    const userOption = {
      value: user.userId,
      label: buildFullName(user),
    };
    return userOption;
  };

  onUserSelect = (option) => {
    const id = option.value;

    if (id) this.getUserAppointments(id);
  };

  mapAppointment = (appointment, index) => {
    const isSeeker = this.state.isSeeker;

    return (
      <AppointmentCard
        isInDashboard={this.props.isInDashboard}
        isSeeker={isSeeker}
        key={index}
        appointment={appointment}
        onHandleConfirm={this.onConfirmClick}
        onHandleDecline={this.onDeclineClick}
        onHandleNoShow={this.onNoShowClick}
        onHandleCancel={this.onCancelClick}
        onHandleComplete={this.onCompleteClick}
        onHandleDelete={this.onDeleteClick}
        handleMessage={this.handleMessage}
      />
    );
  };

  removeAppointmentCard = (appointmentId) => {
    let listOfAppointments = this.state.listOfAppointments;

    listOfAppointments = listOfAppointments.filter(
      (appointmentCard) =>
        appointmentCard.props.appointment.id !== appointmentId
    );

    this.setState((prevState) => ({ ...prevState, listOfAppointments }));
  };

  onPaginationChange = (page) => {
    const currentPage = page;
    const pageIndex = page - 1;
    this.setState(
      (prevState) => {
        return {
          ...prevState,
          pagination: {
            ...prevState.pagination,
            currentPage,
            pageIndex,
          },
        };
      },
      () => this.getAppointments()
    );
  };

  toggleDropDownOpen = () => {
    this.setState((prevState) => ({
      ...prevState,
      dropDown: {
        ...prevState.dropDown,
        isOpen: !prevState.dropDown.isOpen,
      },
    }));
  };

  resetAppointments = () => {
    const listOfAppointments = [];
    this.setState((prevState) => ({ ...prevState, listOfAppointments }));
  };
  //#endregion

  //#region Click Handlers

  onConfirmClick = (appointment) => {
    if (this.state.accountId) {
      // if user has an account, update the appointment
      appointment.isConfirmed = true;
      appointment.SeekerId = appointment.seeker.userId;
      appointment.ProviderId = appointment.provider.userId;
      update(appointment).then(this.onUpdateSuccess).catch(this.onUpdateError);
    } else {
      // if not, prompt the user to sign up
      const swalTitle = `Would you like to connect with Stripe?`;
      const swalText = `You're not connected with Stripe. In order to accept appointments, you must create a Stripe account in order to get paid.`;
      const email = this.props.currentUser.email;
      swalConfirm(swalTitle, swalText, this.sendToConnect, email);
    }
  };

  sendToConnect = (email) => {
    const url = `https://connect.stripe.com/express/oauth/authorize?client_id=${clientKey}&state=${clientState}&suggested_capabilities[]=transfers&stripe_user[email]=${email}`;
    window.location = url;
  };

  onDeclineClick = (appointment) => {
    const reason = `provider_declined`;
    cancelAppointment(appointment.id, reason)
      .then(this.onCancelAppointmentSuccess)
      .then(this.removeAppointmentCard)
      .catch(this.onCancelAppointmentError);
  };

  onCancelClick = (appointment) => {
    const reason = this.state.isSeeker
      ? "seeker_cancelled"
      : "provider_cancelled";
    cancelAppointment(appointment.id, reason)
      .then(this.onCancelAppointmentSuccess)
      .then(this.removeAppointmentCard)
      .catch(this.onCancelAppointmentError);
  };

  onNoShowClick = (appointment) => {
    const reason = `provider_no_show`;
    cancelAppointment(appointment.id, reason)
      .then(this.onCancelAppointmentSuccess)
      .then(this.removeAppointmentCard)
      .catch(this.onCancelAppointmentError);
  };

  onCompleteClick = (appointment) => {
    const chargeTransferRequest = {
      AppointmentId: appointment.id,
      ProviderId: appointment.provider.userId,
    };

    transferCharge(chargeTransferRequest)
      .then(this.onTransferSuccess)
      .then(this.removeAppointmentCard)
      .catch(this.onTransferError);
  };

  onDeleteClick = (appointment) => {
    const id = appointment.id;
    deleteById(id)
      .then(this.onDeleteAppointmentSuccess)
      .then(this.removeAppointmentCard)
      .catch(this.onDeleteAppointmentError);
  };

  handleDropDownClick = (e) => {
    const value = e.target.value;

    const errorMessage = this.getAppointmentErrorMessage(value);
    const appointmentCallback = this.getAppointmentCallback(value);

    const dropDown = {
      ...this.state.dropDown,
      showAll: false,
      showConfirmed: false,
      showCancelled: false,
      showByUser: false,
      errorMessage,
    };

    dropDown[value] = true;

    const pagination = this.getNewPagination();

    this.setDropdown(dropDown, pagination, appointmentCallback);
  };

  getAppointmentErrorMessage = (dropDownValue) => {
    switch (dropDownValue) {
      case "showConfirmed":
        return "No confirmed appointments.";
      case "showCancelled":
        return "No cancelled appointments.";
      case "showByUser":
        return "Please select a user.";
      default:
        //showAll
        return "No appointments, yet.";
    }
  };

  getAppointmentCallback = (dropDownValue) => {
    switch (dropDownValue) {
      case "showConfirmed":
        return this.getConfirmedAppointments;
      case "showCancelled":
        return this.getCancelledAppointments;
      case "showByUser":
        return this.resetAppointments;
      default:
        //showAll
        return this.getAppointments;
    }
  };

  getNewPagination = () => {
    const pagination = {
      totalCount: 0,
      currentPage: 1,
      pageIndex: 0,
      pageSize: this.props.isInDashboard ? 4 : 9,
    };

    return pagination;
  };

  setDropdown = (dropDown, pagination, callback) => {
    this.setState(
      (prevState) => ({ ...prevState, dropDown, pagination }),
      () => {
        if (callback) callback();
      }
    );
  };

  //#endregion

  //#region Success and Error Handlers
  onGetUsersSuccess = (response) => {
    this.setState((prevState) => ({
      ...prevState,
      search: {
        ...prevState.search,
        usersFound: true,
      },
    }));
    return response.items;
  };

  onGetUsersError = (response) => {
    if (response.response.status === 404) return null;
    else _logger({ error: response });
  };

  onGetAccountSuccess = (response) => {
    const accountId = response.item;
    this.setState(
      (prevState) => ({ ...prevState, accountId }),
      () => this.getAppointments()
    );
  };

  onGetAccountError = () => {
    this.getAppointments();
  };

  onTransferSuccess = (id) => {
    toastSuccess(
      "This appointment has been completed, expect payment within two days."
    );
    return id;
  };

  onTransferError = (response) => {
    toastWarn("We were not able to complete this appointment.");
    _logger({ response });
  };

  onCancelAppointmentSuccess = (id) => {
    toastSuccess("Appointment cancelled.");
    return id;
  };

  onCancelAppointmentError = (response) => {
    const errorMsg = response.response.data.errors[0].toString();
    toastError(errorMsg);
  };

  onUpdateSuccess = (appointmentId) => {
    toastSuccess("Appointment has been confirmed!");
    this.removeAppointmentCard(appointmentId);
  };

  onUpdateError = (response) => {
    _logger({ response });
  };

  onDeleteAppointmentSuccess = (id) => {
    toastSuccess("Successfully deleted appointment.");
    return id;
  };

  onDeleteAppointmentError = (response) => {
    toastWarn("We encountered an issue, please try again.");
    _logger({ response });
  };

  onEmailSuccess = (res) => {
    _logger(res);
    this.toggleModal(0);
  };

  onEmailError = (res) => {
    _logger(res);
    this.toggleModal(0);
  };

  onGetAppointmentsSuccess = (response) => {
    const appointments = response.item.pagedItems;
    const listOfAppointments = appointments.map(this.mapAppointment);

    const pagination = {
      pageIndex: response.item.pageIndex,
      totalCount: response.item.totalCount,
      pageSize: response.item.pageSize,
      currentPage: response.item.pageIndex + 1,
    };

    this.setState((prevState) => {
      return {
        ...prevState,
        listOfAppointments,
        pagination,
      };
    });
  };

  onGetAppointmentsError = (response) => {
    if (response.response.status === 404) this.resetAppointments();
    else {
      const errorMsg = response.response.data.errors[0].toString();
      toastError(errorMsg);
    }
  };

  //#endregion

  render() {
    const isInDashboard = this.props.isInDashboard;
    const containerClassName = isInDashboard
      ? "container-fluid"
      : "container-fluid px-md-5";
    const paddingClassName = isInDashboard ? "px-3" : "px-md-3 mx-md-5";

    const Header = () => {
      if (isInDashboard) return null;
      else
        return (
          <div className="row">
            <h1 className="col text-center display-5">Appointments</h1>
          </div>
        );
    };

    return (
      <div className={containerClassName}>
        <div className={paddingClassName}>
          <Header />
          {this.state.isOpen && (
            <AppointmentEmailModal
              isOpen={this.state.isOpen}
              toggleModal={this.toggleModal}
              sendEmail={this.sendEmail}
            />
          )}
          {isInDashboard ? null : (
            <div className="row d-flex">
              {this.state.dropDown.showByUser ? (
                <div className="col-10 col-md-6 mr-auto">
                  <UserSelectPartial
                    userOptions={this.state.search.userOptions}
                    onUserSelect={this.onUserSelect}
                  />
                </div>
              ) : null}
              <Dropdown
                isOpen={this.state.dropDown.isOpen}
                toggle={this.toggleDropDownOpen}
                className="ml-auto"
              >
                <DropdownToggle className="btn btn-success">
                  <i className="fas fa-filter"></i>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem
                    onClick={this.handleDropDownClick}
                    disabled={this.state.dropDown.showAll}
                    value="showAll"
                  >
                    All
                  </DropdownItem>
                  <DropdownItem
                    onClick={this.handleDropDownClick}
                    disabled={this.state.dropDown.showConfirmed}
                    value="showConfirmed"
                  >
                    Confirmed
                  </DropdownItem>
                  <DropdownItem
                    onClick={this.handleDropDownClick}
                    disabled={this.state.dropDown.showCancelled}
                    value="showCancelled"
                  >
                    Cancelled
                  </DropdownItem>
                  {this.state.search.usersFound ? (
                    <DropdownItem
                      onClick={this.handleDropDownClick}
                      disabled={this.state.dropDown.showByUser}
                      value="showByUser"
                    >
                      By User
                    </DropdownItem>
                  ) : null}
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
          {/*  */}
          {this.state.listOfAppointments.length < 1 ? (
            <div className="row">
              <p className="col text-center">
                <small>{this.state.dropDown.errorMessage}</small>
              </p>
            </div>
          ) : (
            <div className="row card-group">
              {this.state.listOfAppointments}
            </div>
          )}
          <div className="d-flex justify-content-center">
            <Pagination
              onChange={this.onPaginationChange}
              current={this.state.pagination.currentPage}
              total={this.state.pagination.totalCount}
              pageSize={this.state.pagination.pageSize}
            />{" "}
          </div>
        </div>
      </div>
    );
  }
}

Appointments.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func, replace: PropTypes.func }),
  location: PropTypes.shape({}),
  currentUser: PropTypes.shape({
    roles: PropTypes.instanceOf(Array),
    email: PropTypes.string,
  }).isRequired,
  isInDashboard: PropTypes.bool,
};

Appointments.defaultProps = {
  isInDashboard: false,
};

export default Appointments;
