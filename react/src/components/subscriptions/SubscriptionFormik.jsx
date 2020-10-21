import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Elements,
  ElementsConsumer,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { subscriptionSchema } from "../../schemas/subscrptionSchema";
import {
  STRIPE_PUBLIC_KEY,
  getStripePrices,
  getStripeSubscription,
  getStripeCustomerId,
  createStripeCustomer,
  createStripeSubscription,
  updateStripeSubscriptionStatus,
  updateStripeSubscriptionPlan,
  updateStripeSubscriptionPayment,
} from "../../services/paymentService";
import SubscriptionCardSection from "./SubscriptionCardSection";
import PriceCard from "./PriceCard";
import debug from "sabio-debug";
import {
  toastError,
  buildFullName,
  toastSuccess,
} from "../../services/utilityService";

const _logger = debug.extend("SubscriptionForm");
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

class SubscriptionFormik extends PureComponent {
  state = {
    formData: {
      name: "",
      email: "",
    },
    status: {
      isLoading: true,
      isProcessing: false,
      isCardComplete: false,
    },
    editing: {
      payment: false,
      plan: false,
    },
    role: "",
    listOfPriceCards: [],
    customer: {
      id: "",
    },
    price: {
      id: "",
      amount: 0,
      statement: "",
      previousId: "",
    },
    subscription: {
      id: "",
    },
  };

  componentDidMount() {
    this.getCustomerId();
    this.getEditingStatus();
    if (!this.props.location.state) this.getSubscription(); // no need to call if state has sub info

    const role = this.getRole();
    this.setRole(role);
    this.getPricesCards(role);
  }

  loadingFinished = () => {
    this.setIsLoading(false);
  };

  getEditingStatus = () => {
    const { state } = this.props.location;
    if (!state) return;

    this.setSubscriptionId(state.subscriptionId);
    this.setPreviousPriceId(state.priceId);
    if (state.isEditingPayment)
      this.setIsEditingPayment(state.isEditingPayment);
    if (state.isEditingPlan) this.setIsEditingPlan(state.isEditingPlan);
  };

  //#region Customer
  getCustomerId = () => {
    getStripeCustomerId()
      .then(this.onGetCustomerSuccess)
      .then(this.setCustomerId)
      .catch(this.onGetCustomerError);
  };

  onGetCustomerSuccess = (response) => {
    const customerId = response.item;
    return customerId;
  };

  setCustomerId = (id) => {
    this.setState((prevState) => ({
      ...prevState,
      customer: { ...prevState.customer, id },
    }));
  };

  onGetCustomerError = () => {
    const customer = {
      name: buildFullName(this.props.currentUser),
      email: this.props.currentUser.email,
    };
    this.createCustomer(customer);
  };

  createCustomer = (customer) => {
    createStripeCustomer(customer)
      .then(this.onCreateCustomerSuccess)
      .then(this.setCustomerId)
      .catch(this.onCreateCustomerError);
  };

  onCreateCustomerSuccess = (response) => {
    const customerId = response.item;
    return customerId;
  };

  onCreateCustomerError = (response) => {
    const errorMsg = response.response.data.errors[0].toString();
    toastError(errorMsg);
  };

  //#endregion

  //#region Roles
  getRole = () => {
    const roles = this.props.currentUser.roles;
    if (roles.includes("Seeker")) return "seeker";
    if (roles.includes("Provider")) return "provider";
  };

  getIsSubscribed = () => {
    const isSubscribed = this.isRoleSubscribed() || this.isSubscriptionFound();
    return isSubscribed;
  };

  isRoleSubscribed = () => {
    const roles = this.props.currentUser.roles;
    return roles.includes("Subscribed");
  };

  isSubscriptionFound = () => {
    const { state } = this.props.location;
    if (state || this.state.subscription.id) return true;

    return false;
  };

  setRole = (role) => {
    this.setState((prevState) => ({ ...prevState, role }));
  };
  //#endregion

  //#region Prices
  getPricesCards = (role) => {
    getStripePrices(role)
      .then(this.onGetPricesSuccess)
      .then(this.renderPriceCards)
      .then(this.loadingFinished)
      .catch(this.onGetPricesError);
  };

  renderPriceCards = (listOfPrices) => {
    if (listOfPrices.length === 1) {
      const { id, unitAmount } = listOfPrices[0];
      this.setPriceStatement(id, unitAmount);
    }

    const listOfPriceCards = listOfPrices.map(this.mapPrice);
    this.setPriceCards(listOfPriceCards);
  };

  setPriceCards = (listOfPriceCards) => {
    this.setState((prevState) => ({
      ...prevState,
      listOfPriceCards,
    }));
  };

  mapPrice = (price, index, list) => {
    const isOnlyPrice = list.length === 1 ? true : false;
    const className = list.length % 2 === 0 ? "col-md-6 mb-3" : "col-md-4 mb-3"; // even or odd

    return (
      <div className={list.length === 1 ? "" : className} key={price.id}>
        <PriceCard
          priceOption={price}
          onPriceSelect={this.setPriceStatement}
          isOnlyPrice={isOnlyPrice}
        />
      </div>
    );
  };

  onGetPricesSuccess = (response) => response.item;

  onGetPricesError = (error) => _logger({ error });

  setPriceStatement = (id, amount) => {
    const statement = `Your card will be charged $${amount / 100}.`;
    const price = { ...this.state.price, id, amount, statement };
    this.setState((prevState) => ({ ...prevState, price }));
  };

  setPreviousPriceId = (previousId) => {
    this.setState((prevState) => ({
      ...prevState,
      price: { ...prevState.price, previousId },
    }));
  };
  //#endregion

  //#region Subscription
  getSubscription = () => {
    getStripeSubscription()
      .then(this.onGetSubscriptionSuccess)
      .then(this.setSubscription)
      .catch(this.onGetSubscriptionError);
  };

  onGetSubscriptionSuccess = (response) => response.item;

  setSubscription = (subscription) => {
    const id = subscription.id;
    const previousId = subscription.plan.id;
    const plan = true;

    this.setState((prevState) => ({
      ...prevState,
      subscription: { ...prevState.subscription, id },
      editing: { ...prevState.editng, plan },
      price: { ...prevState.price, previousId },
    }));
  };

  onGetSubscriptionError = (error) => _logger({ error });

  setSubscriptionId = (id) => {
    this.setState((prevState) => ({
      ...prevState,
      subscription: { ...prevState.subscription, id },
    }));
  };

  createSubscription = (paymentMethodId, billingDetails) => {
    const request = {
      customerId: this.state.customer.id,
      priceId: this.state.price.id,
      paymentMethodId,
      billingDetails,
    }; // StripeSubAddRequest

    createStripeSubscription(request)
      .then(this.onCreateSubscriptionSuccess)
      .then(this.handleSubscriptionStatus)
      .catch(this.onCreateSubscriptionError);
  };

  onCreateSubscriptionSuccess = (response) => response.item;

  handleSubscriptionStatus = (subscription) => {
    const { id, status } = subscription;

    if (status === "active") this.handleSubscriptionActive();
    else {
      this.setIsEditingPayment(true);
      this.setSubscriptionId(id);
      this.handleSubscriptionIncomplete(subscription);
    }
  };

  handleSubscriptionActive = () => {
    const toastMsg = `You've successfully subscribed! Thanks!`;
    toastSuccess(toastMsg);
    this.props.updateCurrentUser();
    this.props.history.push(`/subscriptions`);
  };

  handleSubscriptionIncomplete = (subscription) => {
    const { paymentIntent } = subscription.latestInvoice;
    if (paymentIntent.status === "required_action")
      this.confirmSubscription(paymentIntent);
    else
      this.handleSubscriptionError({
        error: "Status not active and does not require action.",
      });
  };

  confirmSubscription = async (paymentIntent) => {
    const { stripe } = this.props;
    const confirmation = await stripe.confirmCardPayment(
      paymentIntent.clientSecret,
      // eslint-disable-next-line camelcase
      { payment_method: paymentIntent.paymentMethodId }
    );

    if (confirmation.error) this.handleSubscriptionError(confirmation.error);
    else this.finishSubscription();
  };

  finishSubscription = () => {
    const { id } = this.state.subscription;

    updateStripeSubscriptionStatus(id)
      .then(this.handleSubscriptionActive)
      .catch(this.handleSubscriptionError);
  };

  handleSubscriptionError = (error) => {
    if (error) _logger({ error });

    const intent =
      this.state.isEditing.payment || this.state.isEditing.plan
        ? "update"
        : "create";
    const toastMsg = `We're not able to ${intent} your subscription at this time.`;
    toastError(toastMsg);

    this.setIsProcessing(false);
  };

  onCreateSubscriptionError = (error) => this.handleSubscriptionError(error);

  updateSubscription = (paymentMethodId, billingDetails) => {
    if (this.state.editing.payment)
      this.updateSubscriptionPayment(paymentMethodId, billingDetails);
    else if (this.state.editing.plan) this.updateSubscriptionPlan();
  };

  updateSubscriptionPayment = (paymentMethodId, billingDetails) => {
    const request = {
      customerId: this.state.customer.id,
      subscriptionId: this.state.subscription.id,
      paymentMethodId,
      billingDetails,
    }; // StripeSubUpdatePaymentRequest

    updateStripeSubscriptionPayment(request)
      .then(this.onUpdateSubscriptionSuccess)
      .then(this.handleSubscriptionStatus)
      .catch(this.onUpdateSubscriptionError);
  };

  updateSubscriptionPlan = () => {
    if (this.state.price.id === this.state.price.previousId)
      toastError("Please choose a different plan than your current one.");
    else {
      const request = {
        priceId: this.state.price.id,
        subscriptionId: this.state.subscription.id,
      }; // StripeSubUpdatePlanRequest

      updateStripeSubscriptionPlan(request)
        .then(this.onUpdateSubscriptionSuccess)
        .then(this.handleSubscriptionStatus)
        .catch(this.onUpdateSubscriptionError);
    }
  };

  onUpdateSubscriptionSuccess = (response) => response.item;

  onUpdateSubscriptionError = (error) => this.handleSubscriptionError(error);

  //#endregion

  //#region Form Submit
  validateCard = (e) => {
    const event = e;
    const { complete } = event;
    if (complete) this.setIsCardComplete(complete);
  };

  handleSubmit = (values) => {
    const { stripe, elements } = this.props;
    if (!stripe || !elements) return; // Stripe.js has not yet loaded.

    this.setIsProcessing(true);
    const billingDetails = values;

    this.createPaymentRequest(billingDetails);
    // get payment method and add billing details
    // may or may not have to save billing details
  };

  createPaymentRequest = async (billingDetails) => {
    const { stripe, elements } = this.props;
    const paymentMethodRequest = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      // eslint-disable-next-line camelcase
      billing_details: billingDetails,
    });

    paymentMethodRequest.error
      ? this.handlePaymentRequestError(paymentMethodRequest)
      : this.handlePaymentRequestSuccess(paymentMethodRequest, billingDetails);
  };

  handlePaymentRequestError = (paymentMethodRequest) => {
    toastError(paymentMethodRequest.error.message);
    this.setIsProcessing(false);
  };

  handlePaymentRequestSuccess = (paymentMethodRequest, billingDetails) => {
    const { id } = paymentMethodRequest.paymentMethod;
    this.getIsSubscribed()
      ? this.updateSubscription(id, billingDetails)
      : this.createSubscription(id, billingDetails);
  };
  //#endregion

  //#region Status / Back
  setIsLoading = (isLoading) => {
    this.setState((prevState) => ({
      ...prevState,
      status: { ...prevState.status, isLoading },
    }));
  };

  setIsProcessing = (isProcessing) => {
    this.setState((prevState) => ({
      ...prevState,
      status: { ...prevState.status, isProcessing },
    }));
  };

  setIsCardComplete = (isCardComplete) => {
    this.setState((prevState) => ({
      ...prevState,
      status: { ...prevState.status, isCardComplete },
    }));
  };

  setIsEditingPayment = (payment) => {
    this.setState((prevState) => ({
      ...prevState,
      editing: { ...prevState.editing, payment },
    }));
  };

  setIsEditingPlan = (plan) => {
    this.setState((prevState) => ({
      ...prevState,
      editing: { ...prevState.editing, plan },
    }));
  };

  handleBackClick = () => {
    if (this.getIsSubscribed()) this.props.history.push(`/subscriptions`);
    else
      this.props.history.push(
        `/${this.state.role}/${this.props.currentUser.id}/dashboard`
      );
  };

  //#endregion

  render() {
    const isEditingPlan = this.state.editing.plan;
    const isEditingPayment = this.state.editing.payment;
    const isNewSubscriber = isEditingPlan || isEditingPayment ? false : true;

    if (this.state.status.isLoading === true)
      return (
        <div className="container-fluid row justify-content-center">
          <h2 className="font-weight-light">Getting plans...</h2>
        </div>
      );
    else
      return (
        <div className="container-fluid row justify-content-center">
          {isEditingPlan ? (
            <div className="col-12">
              <div className="text-center font-weight-light">
                <h1 className="display-7">Choose a Plan</h1>
              </div>
            </div>
          ) : null}
          {isEditingPlan || isNewSubscriber ? (
            <div
              className={
                this.state.listOfPriceCards.length > 1
                  ? "col-12 row"
                  : "col-md-6"
              }
            >
              {this.state.listOfPriceCards}
            </div>
          ) : null}
          {isEditingPlan ? (
            <div className="col-md-6">
              {this.state.price.statement ? (
                <div className="card">
                  <div className="card-body d-flex align-items-center">
                    <div className="card-text text-secondary small">
                      {this.state.price.statement}
                    </div>
                    <button
                      type="button"
                      data-toggle="tooltip"
                      data-placement="bottom"
                      className="btn ml-auto"
                      title="Back"
                      onClick={this.handleBackClick}
                    >
                      <i className="fas fa-arrow-left" />
                    </button>
                    <button
                      className="btn btn-success"
                      type="button"
                      onClick={this.updateSubscriptionPlan}
                      disabled={
                        this.state.price.id === this.state.price.previousId
                      }
                    >
                      Change Plan
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {isEditingPayment || isNewSubscriber ? (
            <Formik
              enableReinitialize={true}
              validationSchema={subscriptionSchema}
              initialValues={this.state.formData}
              onSubmit={this.handleSubmit}
              validateOnMount={true}
            >
              {(props) => {
                const {
                  values,
                  touched,
                  errors,
                  handleSubmit,
                  isValid,
                } = props;
                const { isProcessing, isCardComplete } = this.state.status;
                const buttonMessage = this.state.subscription.id
                  ? "Update"
                  : "Subscribe";

                return (
                  <div className="col-md-6 col-lg-5">
                    <div className="card border-rounded p-3">
                      <Form onSubmit={handleSubmit}>
                        <div className="card-body">
                          {isEditingPayment ? (
                            <div className="card-title small">
                              Please update your payment:
                            </div>
                          ) : null}
                          <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <Field
                              id="name"
                              name="name"
                              type="text"
                              value={values.name}
                              placeholder="Cardholder's name"
                              className={
                                errors.name && touched.name
                                  ? "form-control error is-invalid"
                                  : "form-control"
                              }
                            />
                            <ErrorMessage
                              className="small error"
                              component="div"
                              name="name"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <Field
                              id="email"
                              name="email"
                              type="text"
                              value={values.email}
                              placeholder="mail@example.com"
                              className={
                                errors.email && touched.email
                                  ? "form-control error is-invalid"
                                  : "form-control"
                              }
                            />
                            <ErrorMessage
                              className="small error"
                              component="div"
                              name="email"
                            />
                          </div>
                          <SubscriptionCardSection
                            className="form-control"
                            onChange={this.validateCard}
                          />
                        </div>
                        <div className="card-body mb-0 pb-0">
                          <div className="card-text text-secondary small">
                            <p>{this.state.price.statement}</p>
                          </div>
                        </div>
                        <div className="card-body mt-0 pt-0">
                          <div className="row justify-content-center">
                            <button
                              type="button"
                              data-toggle="tooltip"
                              data-placement="bottom"
                              className="btn ml-auto"
                              title="Back"
                              onClick={this.handleBackClick}
                            >
                              <i className="fas fa-arrow-left" />
                            </button>
                            <button
                              type="submit"
                              className="btn btn-success"
                              disabled={
                                !isValid || isProcessing || !isCardComplete
                              }
                            >
                              {isProcessing ? "Processing..." : buttonMessage}
                            </button>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </div>
                );
              }}
            </Formik>
          ) : null}
        </div>
      );
  }
}

SubscriptionFormik.propTypes = {
  currentUser: PropTypes.shape({
    userId: PropTypes.number,
    roles: PropTypes.array,
    id: PropTypes.number,
    email: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      priceId: PropTypes.string,
      subscriptionId: PropTypes.string,
      isEditingPayment: PropTypes.bool,
      isEditingPlan: PropTypes.bool,
    }),
  }),
  updateCurrentUser: PropTypes.func.isRequired,
  stripe: PropTypes.shape({
    confirmCardPayment: PropTypes.func,
    createPaymentMethod: PropTypes.func,
  }),
  elements: PropTypes.shape({ getElement: PropTypes.func }),
};

// eslint-disable-next-line react/prop-types
export default function InjectedSubscriptionForm(props) {
  return (
    <Elements stripe={stripePromise}>
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <SubscriptionFormik stripe={stripe} elements={elements} {...props} />
        )}
      </ElementsConsumer>
    </Elements>
  );
}
