import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { SelectFormik } from "../utilities/select-formik/SelectFormik";
import "./AppointmentAvailability.css";
import SelectFormikSpecial from "../utilities/select-formik/SelectFormikSpecial";
import { appointmentAvailabilitySchema } from "./AppointmentAvailabilitySchema";
import { timeReference } from "./timeKey";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAvailabilityData } from "../../services/appointmentService";
import { FormGroup, Label, Row, Col } from "reactstrap";
import { Field, Form, Formik, ErrorMessage } from "formik";
import stripeImage from "../../assets/images/powered-by-stripe.png";
import debug from "sabio-debug";
const _logger = debug.extend("AppointmentAvailability");

class AppointmentAvailability extends PureComponent {
  state = {
    availabilityArray: [],
    availabilityArray2: [],
    formData: {
      day: new Date(),
      startTime: 1,
      endTime: 1,
    },
    availableTimes: [],
    availableTimes2: [],
    isGoodDate: true,
  };
  componentDidMount() {
    //call to get the schedules and appointments for given date
    this.setState(
      (prevState) => {
        return { ...prevState, availabilityArray: timeReference };
      },
      () => this.dateSelected(new Date())
    );
  }

  convertDateToString = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateString = `${year}-${month}-${day}`;
    return dateString;
  };

  dateSelected = (day) => {
    const dayString = this.convertDateToString(day);
    _logger("dateSelected", dayString);
    getAvailabilityData(this.props.providerId, dayString)
      .then(this.onSuccessGetAvailability)
      .catch(this.onErrorGetAvailability);
  };

  onSuccessGetAvailability = (response) => {
    _logger("success getting availability", response);
    this.setSchedules(response.item);
  };

  onErrorGetAvailability = (error) => {
    _logger("error getting availability", error);
    let noTimeOptions = ["none"];
    this.setState((prevState) => {
      return {
        ...prevState,
        availableTimes: noTimeOptions.map(this.mapTimes),
        availableTimes2: noTimeOptions.map(this.mapTimes),
        availabilityArray: timeReference,
        isGoodDate: false,
      };
    });
  };

  noAppointmentsAvailable = () => {
    //toggle fields to d-none
    //toggle text to reveal "no appointments available on this date"
    //make sure that upon selectDate fields are toggled back
  };

  setSchedules = (item) => {
    let timeKey = [...this.state.availabilityArray];
    if (item.scheduleAvailability !== null) {
      //Looping through multiple schedule arrays
      for (
        let sIndex = 0;
        sIndex < item.scheduleAvailability.length;
        sIndex++
      ) {
        const currentSchedule = item.scheduleAvailability[sIndex];

        //step 1a: change times to 30 minute intervals
        let startHour = parseInt(currentSchedule.startTime.substring(0, 2));
        let startMinute = parseInt(currentSchedule.startTime.substring(3, 5));
        let endHour = parseInt(currentSchedule.endTime.substring(0, 2));
        let endMinute = parseInt(currentSchedule.endTime.substring(3, 5));

        //make sure we are only scheduling today up to 23:30
        if (
          (endHour === 0 && endMinute === 0) ||
          endHour < startHour ||
          (endHour === 23 && endMinute > 30)
        ) {
          endHour = 23;
          endMinute = 30;
        }
        //The next two round minutes up to 30 if over 0
        if (startMinute < 30 && startMinute > 0) {
          startMinute = 30;
        }
        if (endMinute < 30 && endMinute > 0) {
          endMinute = 30;
        }
        //next two round up to the nearest hour if over 30 minutes
        if (startMinute > 30) {
          startMinute = 0;
          startHour = startHour + 1;
        }
        if (endMinute > 30) {
          endMinute = 0;
          endHour = endHour + 1;
        }
        //step 1b. convert schedule times to dateObjs using today's date so we can manipulate them.
        let scheduleTime = new Date();
        let scheduleEndTime = new Date();
        scheduleTime.setHours(startHour, startMinute, "0", "0");
        scheduleEndTime.setHours(endHour, endMinute, "0", "0");
        const diffTime = Math.abs(scheduleTime - scheduleEndTime);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        //step 1c. Convert those date obj's to arrays of times strings.
        let scheduleArray = [];

        for (let dIndex = 0; dIndex < diffHours * 2; dIndex++) {
          let timeString = new Date(scheduleTime)
            .toTimeString()
            .substring(0, 8);
          scheduleArray.push(timeString);
          scheduleTime.setMinutes(scheduleTime.getMinutes() + 30);
        }

        //step 2: loop through time key to change isOnSchedule and isAvailable to true
        //        if the time is in the schedule array
        for (let index = 0; index < scheduleArray.length; index++) {
          const currentTime = scheduleArray[index];
          const matchingIndex = timeKey.findIndex(
            (obj) => obj.time === currentTime
          );
          timeKey[matchingIndex].isAvailable = true;
          timeKey[matchingIndex].isOnSchedule = true;
        }
      }
    }

    if (item.appointments !== null) {
      //A new big for loop to loop through multiple appointment arrays
      for (let index = 0; index < item.appointments.length; index++) {
        let appointmentArray = [];
        let appointmentTime = new Date(item.appointments[index].startTime);
        let appointmentEndTime = new Date(item.appointments[index].endTime);
        //line below makes sure we're working with the same date
        appointmentEndTime.setDate(appointmentTime.getDate());
        let apStartHr = parseInt(
          appointmentTime.toString().substring(16, 18),
          10
        );
        let apStartMin = parseInt(
          appointmentTime.toString().substring(19, 21),
          10
        );
        let apEndHr = parseInt(
          appointmentEndTime.toString().substring(16, 18),
          10
        );
        let apEndMin = parseInt(
          appointmentEndTime.toString().substring(19, 21),
          10
        );
        //round up minutes to nearest 30 min
        if (apStartMin > 0 && apStartMin < 30) {
          appointmentTime.setHours(apStartHr, 30, 0, 0);
        }
        if (apEndMin > 0 && apEndMin < 30) {
          appointmentEndTime.setHours(apEndHr, 30, 0, 0);
        }
        if (apStartMin > 30 && apStartHr < 23) {
          appointmentTime.setHours(apStartHr + 1, 0, 0, 0);
        }
        if (apEndMin > 30 && apEndHr < 23) {
          appointmentEndTime.setHours(apEndHr + 1, 0, 0, 0);
        }
        //if at the end of the day and rounding up select the last time.
        if (apStartMin > 30 && apStartHr === 23) {
          appointmentTime.setHours(23, 30, 0, 0);
        }
        if (apEndMin > 30 && apEndHr === 23) {
          appointmentEndTime.setHours(23, 30, 0, 0);
        }
        //if there is an appoinment that goes into next day, stop at 23:30
        if (apStartHr > apEndHr) {
          appointmentEndTime.setHours(23, 30, 0, 0);
        }
        const diffTime = Math.abs(appointmentEndTime - appointmentTime);
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

        // step 3a convert appointments to an array of time strings
        for (let dIndex = 0; dIndex < diffHours * 2; dIndex++) {
          let timeString = new Date(appointmentTime)
            .toTimeString()
            .substring(0, 8);
          appointmentArray.push(timeString);
          appointmentTime.setMinutes(appointmentTime.getMinutes() + 30);
        }

        //3b. loop through timeKey to change isAvailable back to false if it is an appointment array
        for (let apIndex = 0; apIndex < appointmentArray.length; apIndex++) {
          const currentTime = appointmentArray[apIndex];
          const matchingIndex = timeKey.findIndex(
            (obj) => obj.time === currentTime
          );
          timeKey[matchingIndex].isAvailable = false;
        }
      }
    }

    let times = timeKey.filter((obj) => obj.isOnSchedule === true);
    let timeOptions = ["none"];
    if (times[0] !== null) {
      timeOptions = times.map(this.mapTimes);
    }

    this.setState((prevState) => {
      return {
        ...prevState,
        availabilityArray: timeKey,
        availableTimes: timeOptions,
        isGoodDate: true,
      };
    });
  };

  mapTimes = (obj) => {
    let timeOption = {};

    if (obj.isAvailable === false) {
      timeOption = {
        value: obj.id,
        label: obj.clock,
        isDisabled: true,
      };
    } else {
      timeOption = {
        value: obj.id,
        label: obj.clock,
        isDisabled: false,
      };
    }

    return timeOption;
  };

  handlePurchase = (values) => {
    _logger("handlePurchase", values);
    //send out call to stripe
  };

  handleSubmit = (values) => {
    _logger(values);
    const availability = [...this.state.availabilityArray2];
    const startObj = availability[values.startTime - 1];
    const endObj = availability[values.endTime - 1];
    const startHr = startObj.time.substring(0, 2);
    const startMin = startObj.time.substring(3, 5);
    const endHr = endObj.time.substring(0, 2);
    const endMin = endObj.time.substring(3, 5);
    let startDate = new Date(values.day);
    startDate.setHours(startHr, startMin, "0", "0");
    let endDate = new Date(values.day);
    endDate.setHours(endHr, endMin, "0", "0");
    const timeDifference = (values.endTime - values.startTime) / 2;
    const price = Math.ceil(this.props.price * timeDifference * 100) / 100;
    const data = {
      hourlyRate: this.props.price,
      totalHours: timeDifference,
      apPrice: price,
      providerId: this.props.providerId,
      userId: this.props.userId,
      apStart: startDate,
      apEnd: endDate,
      providerFirstName: this.props.providerFirstName,
      providerLastName: this.props.providerLastName,
    };

    this.props.history.push(
      `/appointment/${this.props.providerId}/checkout`,
      data
    );

    _logger(
      "imitate purchase. price:",
      price,
      "providerId",
      this.props.providerId,
      "seekerId",
      this.props.userId
    );
    _logger(
      "imitate appointment call. startDate:",
      startDate,
      "endDate:",
      endDate
    );
  };

  startTimeSelected = (startTime) => {
    _logger("startTimeSelected", startTime);
    let startIndex = startTime - 1;
    let timeKey = [...this.state.availabilityArray];
    let newKey = [];
    let appointmentHit = false;

    for (let index = 0; index < timeKey.length; index++) {
      let currentObj = timeKey[index];
      let newObj = { ...currentObj };
      if (
        index > startIndex &&
        newObj.isOnSchedule === true &&
        newObj.isAvailable === false
      ) {
        //in this case we've hit an appointment
        appointmentHit = true;
      }

      if (index <= startIndex || appointmentHit === true) {
        //make sure times earlier than or equal to the start time are unavailable
        //if appointmentHit is true then we need to make sure all later times are unavailable as well
        newObj.isAvailable = false;
      }
      newKey.push(newObj);
    }

    let times = newKey.filter((obj) => obj.isOnSchedule === true);
    const timeOptions = times.map(this.mapTimes);

    _logger("timeKey2", newKey);
    this.setState((prevState) => {
      return {
        ...prevState,
        availabilityArray2: newKey,
        availableTimes2: timeOptions,
      };
    });
  };

  render() {
    _logger("render AppointmentAvail");
    const availableTimes = this.state.availableTimes;
    const availableTimes2 = this.state.availableTimes2;

    return (
      <React.Fragment>
        <div className="center">
          <div className="appointment-box">
            <Formik
              enableReinitialize={true}
              validationSchema={appointmentAvailabilitySchema}
              initialValues={this.state.formData}
              onSubmit={this.handleSubmit}
              onSelect={this.dateSelected}
            >
              {(props) => {
                const { values, handleSubmit, setFieldValue } = props;
                return (
                  <div className="row">
                    <Form onSubmit={handleSubmit}>
                      <FormGroup>
                        <Row>
                          <Col xs="5">
                            <Label>Booking Date</Label>
                          </Col>
                          <Col xs="6">
                            <div className="customDatePickerWidth">
                              <DatePicker
                                name="day"
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                dateFormat="MM/dd/yyyy"
                                withPortal
                                selected={
                                  (values.day && new Date(values.day)) || null
                                }
                                value={values.day}
                                onChange={(day) => setFieldValue("day", day)}
                                onSelect={(day) => this.dateSelected(day)}
                              />
                            </div>
                          </Col>
                        </Row>
                      </FormGroup>
                      <p
                        className={
                          this.state.isGoodDate === false
                            ? "not-available"
                            : "d-none"
                        }
                      >
                        Not Available. Pick Another Date.
                      </p>
                      <div
                        className={
                          this.state.isGoodDate === true
                            ? "time-fields"
                            : "d-none"
                        }
                      >
                        <FormGroup>
                          <Row>
                            {" "}
                            <Col xs="5">
                              <Label>Start Time</Label>
                            </Col>
                            <Col xs="7">
                              <Field
                                key={"startTime"}
                                name="startTime"
                                component={SelectFormikSpecial}
                                placeholder=""
                                options={availableTimes}
                                isSearchable
                                isClearable
                                startTimeSelected={this.startTimeSelected}
                              />
                              <ErrorMessage
                                className="error"
                                component="div"
                                name="startTime"
                              />
                            </Col>
                          </Row>
                        </FormGroup>
                        <FormGroup>
                          <Row>
                            <Col xs="5">
                              <Label>End Time</Label>
                            </Col>
                            <Col xs="7">
                              <Field
                                key={"endTime"}
                                name="endTime"
                                component={SelectFormik}
                                placeholder=""
                                options={availableTimes2}
                                isClearable
                              />
                              <ErrorMessage
                                className="error"
                                component="div"
                                name="endTime"
                              />
                            </Col>
                          </Row>
                        </FormGroup>
                      </div>
                      <div className="checkout-button">
                        <button
                          type="submit"
                          data-toggle="tooltip"
                          data-placement="bottom"
                          className="btn btn-primary btn-block mb-2"
                          title="Request"
                        >
                          Request For Hire
                        </button>
                        <img src={stripeImage} alt="stripe" width="250"></img>
                      </div>
                    </Form>
                  </div>
                );
              }}
            </Formik>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AppointmentAvailability;

AppointmentAvailability.propTypes = {
  providerId: PropTypes.number,
  price: PropTypes.number,
  userId: PropTypes.number,
  providerFirstName: PropTypes.string,
  providerLastName: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};
