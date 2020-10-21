import axios from "axios";
import {
  API_HOST_PREFIX,
  onGlobalSuccess,
  onGlobalError,
} from "../services/serviceHelpers";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = API_HOST_PREFIX + "/api/jobs";

const getAll = (pageIndex, pageSize) => {
  const endpoint = `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

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
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const add = (payload) => {
  const config = {
    method: "POST",
    url: baseUrl,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const updateById = (payload) => {
  const config = {
    method: "PUT",
    url: baseUrl + `/${payload.id}`,
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

const searchJobs = (query, pageIndex, pageSize) => {
  const endpoint = `/search?query=${query}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getJobsNearby = (pageIndex, pageSize, radius, zip) => {
  const endpoint = `/nearby?pageIndex=${pageIndex}&pageSize=${pageSize}&radius=${radius}&zip=${zip}`;
  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const searchJobsNearby = (query, pageIndex, pageSize, radius, zip) => {
  const endpoint = `/nearby/search?query=${query}&pageIndex=${pageIndex}&pageSize=${pageSize}&radius=${radius}&zip=${zip}`;
  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    withCredentials: true,
    crossdomain: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export {
  getAll,
  getById,
  getCreatedBy,
  add,
  updateById,
  deleteById,
  searchJobs,
  getJobsNearby,
  searchJobsNearby,
};
