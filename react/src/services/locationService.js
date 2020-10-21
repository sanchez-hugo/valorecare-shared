import axios from "axios";
import {
  onGlobalError,
  onGlobalSuccess,
  API_HOST_PREFIX,
} from "../services/serviceHelpers";
import logger from "sabio-debug";
const _logger = logger.extend("LocationService");

const baseUrl = `${API_HOST_PREFIX}/api/locations`;
const GOOGLE_MAP_KEY = process.env.REACT_APP_GOOGLE_MAP;

const getAll = (pageIndex, pageSize) => {
  const endpoint = `/paginate?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const search = (pageIndex, pageSize, query) => {
  const endpoint = `/search?pageIndex=${pageIndex}&pageSize=${pageSize}&query=${query}`;
  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getCreatedBy = (pageIndex, pageSize) => {
  const endpoint = `/createdby?pageIndex=${pageIndex}&pageSize=${pageSize}`;

  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
const getById = (id) => {
  const config = {
    method: "GET",
    url: baseUrl + `/${id}`,
    crossdomain: true,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getLatLongByZip = (zip) => {
  _logger("zipcode", zip);
  const config = {
    method: "GET",
    url: baseUrl + `?zip=${zip}`,
    crossdomain: true,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
//Unsure of how to properly create axios call for this call
//
// const getByGeo = (geo) => {
//   const config = {
//     method: "GET",
//     url: baseUrl + `/${geo}`,
//     crossdomain: true,
//     withCredentials: true,
//     headers: { "Content-Type": "application/json" },
//   };

//   return axios(config).then(onGlobalSuccess).catch(onGlobalError);
// };

const update = (payload) => {
  const config = {
    method: "PUT",
    url: baseUrl + `${payload.id}`,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const create = (payload) => {
  const config = {
    method: "POST",
    url: `${baseUrl}`,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const deleteById = (id) => {
  const config = {
    method: "DELETE",
    url: baseUrl + `/${id}`,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config)
    .then(onGlobalSuccess)
    .then(() => id)
    .catch(onGlobalError);
};

export {
  getAll,
  getById,
  update,
  getCreatedBy,
  create,
  deleteById,
  search,
  getLatLongByZip,
  GOOGLE_MAP_KEY,
};
