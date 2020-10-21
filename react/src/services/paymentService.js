import axios from 'axios';
import {
  API_HOST_PREFIX,
  onGlobalSuccess,
  onGlobalError,
} from './serviceHelpers';

const baseUrl = API_HOST_PREFIX + "/api/payments";
const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

const createClientSecret = (options) => {
  const endpoint = '/intent';
  const config = {
    method: 'POST',
    url: baseUrl + endpoint,
    data: options,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getStripeCustomerId = () => {
  const endpoint = '/customer';
  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const createStripeCustomer = (options) => {
  const endpoint = '/customer';
  const config = {
    method: 'POST',
    url: baseUrl + endpoint,
    data: options,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const createStripeIntent = (options) => {
  const endpoint = '/intent';
  const config = {
    method: 'POST',
    url: baseUrl + endpoint,
    data: options,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getStripePrices = (role) => {
  const endpoint = `/prices?role=${role}`;
  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getStripePricesById = (productId) => {
  const endpoint = `/products?id=${productId}`;
  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const createStripeSubscription = (payload) => {
  const endpoint = `/subscription`;
  const config = {
    method: 'POST',
    url: baseUrl + endpoint,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const updateStripeSubscriptionPlan = (payload) => {
  const endpoint = `/subscription/plan`;
  const config = {
    method: 'PUT',
    url: baseUrl + endpoint,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const updateStripeSubscriptionPayment = (payload) => {
  const endpoint = `/subscription/payment`;
  const config = {
    method: 'PUT',
    url: baseUrl + endpoint,
    data: payload,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const updateStripeSubscriptionStatus = (id) => {
  const endpoint = `/subscription/status?id=${id}`;
  const config = {
    method: "PUT",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const getStripeSubscription = () => {
  const endpoint = `/subscription`;
  const config = {
    method: 'GET',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

/* Call this if trying to get subscription status from our DB */
const getStripeSubscriptionStatus = () => {
  const endpoint = `/subscription/status`;
  const config = {
    method: "GET",
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

const cancelStripeSubscription = (subscriptionId) => {
  const endpoint = `/subscription?id=${subscriptionId}`;
  const config = {
    method: 'DELETE',
    url: baseUrl + endpoint,
    crossdomain: true,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  };

  return axios(config).then(onGlobalSuccess).catch(onGlobalError);
};

export {
  STRIPE_PUBLIC_KEY,
  createClientSecret,
  getStripeCustomerId,
  createStripeCustomer,
  getStripePrices,
  getStripePricesById,
  getStripeSubscription,
  getStripeSubscriptionStatus,
  createStripeSubscription,
  updateStripeSubscriptionPlan,
  updateStripeSubscriptionPayment,
  updateStripeSubscriptionStatus,
  cancelStripeSubscription,
  createStripeIntent,
};
