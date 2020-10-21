import axios from 'axios';
import {
  API_HOST_PREFIX,
  onGlobalSuccess,
  onGlobalError,
} from '../services/serviceHelpers';

const baseUrl = API_HOST_PREFIX + '/api/lookup';

const getAllLookUps = () => {

  const config = {
    method: 'GET',
    url: baseUrl,
    crossdomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};
/*

Options:

    "DaysOfWeek"
    "Roles"
    "UserStatus"
    "TokenTypes"
    "TokeTypes"
    "UrlTypes"
    "EventStatus"
    "BlogTypes"
    "EventTypes"
    "VirtualType"
    "EntityTypes"
    "GenderTypes"
    "FilesTypes"
    "States"
    "JobType"
    "Languages"
    "TitleTypes"
    "ExpertiseTypes"
    "Tags"
    "HelpNeedTypes"
    "CareNeedsTypes"
    "ConcernTypes"
    "Ratings"
    "PaymentTypes"
    "CertificateTypes"
    "LicenseTypes"
    "LocationTypes"

*/

const getType = type => {
  const endpoint = `/type?type=${type}`;

  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const searchType = (type, query, pageIndex, pageSize) => {
  const endpoint = `/type?type=${type}&query=${query}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getProviderTypes = () => {
  const endpoint = `/provider-types`;

  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export {
  getType,
  searchType,
  getProviderTypes,
  getAllLookUps
};