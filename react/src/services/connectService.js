import axios from "axios";
import {
  API_HOST_PREFIX,
  onGlobalSuccess,
  onGlobalError,
} from "./serviceHelpers";

const baseUrl = API_HOST_PREFIX + "/api/connect";
const STRIPE_CLIENT_KEY = process.env.REACT_APP_STRIPE_CLIENT_ID;

const getAccountId = () => {
  const endpoint = `/account`;

  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getAccountIdByUserId = (id) => {
  const endpoint = `/account/user?id=${id}`;

  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const createPaymentIntent = (options) => {
  const endpoint = `/intent`;

  const config = {
    method: "POST",
    url: baseUrl + endpoint,
    data: options,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const createCharge = (payload) => {
  const endpoint = `/charge/appointment`;

  const config = {
    method: "POST",
    url: baseUrl + endpoint,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const refundCharge = (id, reason) => {
  const endpoint = `/charge/appointment?id=${id}&reason=${reason}`;

  const config = {
    method: "PUT",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config)
    .then(onGlobalSuccess)
    .then(() => id)
    .catch(onGlobalError);
};

const transferCharge = (payload) => {
  const endpoint = `/transfer`;

  const config = {
    method: "POST",
    url: baseUrl + endpoint,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  const id = payload.AppointmentId;
  return axios(config)
    .then(onGlobalSuccess)
    .then(() => id)
    .catch(onGlobalError);
};

const getTransactionsList = () => {
  const endpoint = `/transactions`;

  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export {
  STRIPE_CLIENT_KEY,
  getAccountId,
  getAccountIdByUserId,
  createPaymentIntent,
  createCharge,
  refundCharge,
  transferCharge,
  getTransactionsList,
};
