import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import swal from "sweetalert";

//#region Locations
const buildAddress = (location) => {
  const address = location.lineTwo
    ? `${location.lineOne} ${location.lineTwo}, ${location.city}, ${location.state.name} ${location.zip}`
    : `${location.lineOne}, ${location.city}, ${location.state.name} ${location.zip}`;
  return address;
};

const buildCityState = (location) => {
  const address = `${location.city}, ${location.state.name}`;
  return address;
};
//#endregion

//#region
const getAppointmentStatus = (appointment) => {
  const isCancelled = appointment.isCancelled;
  const isConfirmed = appointment.isConfirmed;
  if (isCancelled) return "Cancelled";
  else {
    const stage = getAppointmentStage(appointment);
    if (stage === "before") {
      if (isConfirmed) return "Confirmed";
      else return "Not Confirmed";
    } else if (stage === "during") {
      return "In Progress";
    } else if (stage === "after") {
      if (isConfirmed) return "Completed";
      else return "Missed";
    } else return "Unknown";
  }
};

const getAppointmentStage = (appointment) => {
  const dateNow = new Date();
  const dateStart = new Date(appointment.startTime);
  const dateEnd = new Date(appointment.startTime);

  if (dateNow < dateStart) return "before";
  else if (dateNow < dateEnd) return "during";
  else if (dateNow > dateEnd) return "after";
  else return "unknown";
};
//#endregion

//#region UserProfiles
const buildFullName = (user) => {
  const fullName = user.firstName + " " + user.lastName;
  return fullName;
};
//#endregion

//#region Dates
const buildDate = (utcTime) => {
  const length = utcTime.length;
  let newDate;
  if (utcTime.charAt(length - 1) === "Z") newDate = new Date(utcTime);
  else newDate = new Date(utcTime + "Z");

  return newDate;
};

const buildDateShort = (utcTime) => {
  // Returns a string similar to: Wed Jul 28 1993

  const length = utcTime.length;
  let newDate;
  if (utcTime.charAt(length - 1) === "Z") newDate = new Date(utcTime);
  else newDate = new Date(utcTime + "Z");

  return newDate.toDateString();
};

const buildDateLong = (utcTime) => {
  // Returns a string similar to: Tue Aug 19 1975 23:15:30 GMT+0200 (CEST)

  const length = utcTime.length;
  let newDate;
  if (utcTime.charAt(length - 1) === "Z") newDate = new Date(utcTime);
  else newDate = new Date(utcTime + "Z");

  return newDate.toString();
};

const buildDateTime = (utcTime) => {
  // Returns a string similar to: 1:15:30 AM

  const length = utcTime.length;
  let newDate;
  if (utcTime.charAt(length - 1) === "Z") newDate = new Date(utcTime);
  else newDate = new Date(utcTime + "Z");

  return newDate.toLocaleTimeString("en-US");
};

const buildDateLength = (start, end) => {
  /* If startDate and endDate are the same day, returns a string similar to: 
    Fri Jul 10 2020 9:00:00 AM - 5:00:00 PM
  Else returns a string similar to:
    Fri Jul 10 2020 9:00:00 AM - Fri Jul 11 2020 5:00:00 PM */

  const date = {};

  const startDate = buildDateShort(start);
  const endDate = buildDateShort(end);

  if (startDate === endDate) date.day = startDate;
  else date.day = `${startDate} - ${endDate}`;

  const startTime = buildDateTime(start);
  const endTime = buildDateTime(end);

  if (startTime === endTime) date.time = startTime;
  else date.time = `${startTime} - ${endTime}`;

  return date;
};
//#endregion

//#region Messages
const toastSuccess = (toastMsg) => {
  toast.success(toastMsg, {
    autoClose: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: false,
  });
};

const toastError = (toastMsg) => {
  toast.error(toastMsg, {
    autoClose: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: false,
  });
};

const toastWarn = (toastMsg) => {
  toast.warn(toastMsg, {
    autoClose: 2000,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: false,
  });
};

const swalConfirm = (swalTitle, swalText, callback, callbackParam) => {
  swal({
    title: swalTitle,
    text: swalText,
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willContinue) => {
    if (willContinue) callback(callbackParam);
  });
};
//#endregion

const convertCostToString = (cost) => {
  const newCost = cost / 100;
  const costString = `$${newCost}`;
  return costString;
};

const truncateText = (text, limit) => {
  if (text.length > limit) return text.substring(0, limit) + "...";
  else return text;
};

const isRoleOf = (roles, specificRole) => {
  const isSpecifcRole = roles.includes(specificRole);
  return isSpecifcRole;
};

export {
  buildAddress,
  buildCityState,
  getAppointmentStatus,
  getAppointmentStage,
  buildFullName,
  buildDate,
  buildDateShort,
  buildDateLong,
  buildDateTime,
  buildDateLength,
  toastSuccess,
  toastError,
  toastWarn,
  swalConfirm,
  convertCostToString,
  truncateText,
  isRoleOf,
};
