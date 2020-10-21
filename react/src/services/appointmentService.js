import axios from "axios";
import {
  onGlobalSuccess,
  onGlobalError,
  API_HOST_PREFIX,
} from "./serviceHelpers";

const baseUrl = `${API_HOST_PREFIX}/api/appointments`;

//#region Provider Appointments
const getProviderAppointments = (pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/provider?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getProviderConfirmedAppointments = (pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/provider/confirmed?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getProviderCancelledAppointments = (pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/provider/cancelled?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getProviderUserAppointments = (id, pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/provider/user?id=${id}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getProviderUsers = () => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/provider/users`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
//#endregion

//#region Seeker Appointments
const getSeekerAppointments = (pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/seeker?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getSeekerConfirmedAppointments = (pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/seeker/confirmed?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getSeekerCancelledAppointments = (pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/seeker/cancelled?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getSeekerUserAppointments = (id, pageIndex, pageSize) => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/seeker/user?id=${id}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getSeekerUsers = () => {
  // referenced by appointments
  const config = {
    method: "GET",
    url: `${baseUrl}/seeker/users`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
//#endregion

const getByAppointmentId = (id) => {
  // referenced by appointment form // delete?
  const config = {
    method: "GET",
    url: `${baseUrl}/${id}`,
    crossdomain: true,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

//#region C-UD
const addAppointment = (payload) => {
  // referenced by appointment form and connect checkout 2
  const config = {
    method: "POST",
    url: `${baseUrl}`,
    data: payload,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const update = (payload) => {
  // referenced by appointment form and appointments
  const config = {
    method: "PUT",
    url: `${baseUrl}/${payload.id}`,
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config)
    .then(onGlobalSuccess)
    .then(() => payload.id)
    .catch(onGlobalError);
};

const deleteById = (id) => {
  // referenced by appointments
  const config = {
    method: "DELETE",
    url: `${baseUrl}/${id}`,
  };
  return axios(config)
    .then(onGlobalSuccess)
    .then(() => id)
    .catch(onGlobalError);
};
//#endregion

//#region Non-Appointment
const getAvailabilityData = (providerId, date) => {
  // referened by appointment availablity
  const config = {
    method: "GET",
    url: `${baseUrl}/availability?userId=${providerId}&scheduleDate=${date}`,
    crossdomain: true,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const reachOut = (payload) => {
  // referenced by appointments and job details
  const config = {
    method: "POST",
    url: `${baseUrl}/email`,
    data: payload,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getAllProvidersLog = (pageIndex, pageSize) => {
  // referenced by transactions
  const config = {
    method: "GET",
    url: `${baseUrl}/seekerProviderLog?pageIndex=${pageIndex}&pageSize=${pageSize}`,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
//#endregion

export {
  getProviderAppointments,
  getProviderConfirmedAppointments,
  getProviderCancelledAppointments,
  getProviderUserAppointments,
  getProviderUsers,
  getSeekerAppointments,
  getSeekerConfirmedAppointments,
  getSeekerCancelledAppointments,
  getSeekerUserAppointments,
  getSeekerUsers,
  getByAppointmentId,
  getAvailabilityData,
  addAppointment,
  update,
  deleteById,
  getAllProvidersLog,
  reachOut,
};
