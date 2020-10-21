import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  getStripePricesById,
  getStripeSubscription,
  cancelStripeSubscription,
} from "../../services/paymentService";
import debug from "sabio-debug";
import { toastError, toastSuccess } from "../../services/utilityService";
import SubscriptionCard from "./SubscriptionCard";
const _logger = debug.extend("Subscriptions");

class Subscriptions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      subscription: {},
      listOfSubscriptions: [],
      hasMorePlans: false,
    };
  }

  componentDidMount = () => {
    this.getSubscriptions();
  };

  getSubscriptions = () => {
    getStripeSubscription()
      .then(this.onGetSubscriptionsSuccess)
      .catch(this.onGetSubscriptionsError);
  };

  getProductId = () => {
    const subscription = this.state.subscription;
    const productId = subscription.plan.productId;
    getStripePricesById(productId)
      .then(this.onGetStripePricesByIdSuccess)
      .catch(this.onGetStripePricesByIdError);
  };

  renderSubscriptions = () => {
    const subscription = this.state.subscription;

    const listOfSubscriptions = this.mapSubscriptions(subscription);
    this.setSubscriptions(listOfSubscriptions);
  };

  mapSubscriptions = (subscription) => {
    return (
      <SubscriptionCard
        subscription={subscription}
        editPaymentMethod={this.handleEditPaymentMethod}
        editPlan={this.handleEditPlan}
        cancelSubscription={this.handleCancelSubscription}
        hasMorePlans={this.state.hasMorePlans}
      />
    );
  };

  //#region Success and Error Handlers
  onCancelSubscriptionsSuccess = (response) => {
    toastSuccess(`Your subscription was successfully cancelled.`);
    this.props.updateCurrentUser();
    return response.item;
  };

  onCancelSubscriptionsError = (response) => {
    const errorMsg = response.response.data.errors[0].toString();
    toastError(errorMsg);
  };

  onGetSubscriptionsSuccess = (response) => {
    this.setSubscriptionList(response.item);
  };

  onGetSubscriptionsError = () => {
    this.props.history.push("/subscribe");
  };

  onGetStripePricesByIdSuccess = (response) => {
    const hasMorePlans = response.item.length > 1 ? true : false;
    this.setHasMorePlans(hasMorePlans);
  };

  onGetStripePricesByIdError = (error) => {
    _logger({ error });
  };
  //#endregion

  //#region State Manipulation
  setSubscriptionList = (subscription) => {
    this.setState(
      (prevState) => ({ ...prevState, subscription }),
      () => {
        this.getProductId();
      }
    );
  };

  setHasMorePlans = (hasMorePlans) => {
    this.setState(
      (prevState) => ({ ...prevState, hasMorePlans }),
      () => {
        this.renderSubscriptions();
      }
    );
  };

  setSubscriptions = (listOfSubscriptions) => {
    this.setState((prevState) => ({ ...prevState, listOfSubscriptions }));
  };
  //#endregion

  //#region Event Handlers
  handleEditPlan = (subscription) => {
    const state = {
      subscriptionId: subscription.id,
      priceId: subscription.plan.id,
      isEditingPlan: true,
      isEditingPaymentMethod: false,
    };
    this.props.history.push("/subscribe", state);
  };

  handleEditPaymentMethod = (subscription) => {
    const state = {
      subscriptionId: subscription.id,
      priceId: subscription.plan.id,
      isEditingPlan: false,
      isEditingPayment: true,
    };
    this.props.history.push("/subscribe", state);
  };

  handleCancelSubscription = (subscriptionId) => {
    cancelStripeSubscription(subscriptionId)
      .then(this.onCancelSubscriptionsSuccess)
      .then(this.getSubscriptions)
      .catch(this.onCancelSubscriptionsError);
  };
  //#endregion

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <h1 className="col text-center display-5">Subscription Settings</h1>
        </div>
        <div className="row card-group justify-content-center">
          {this.state.listOfSubscriptions}
        </div>
      </div>
    );
  }
}

Subscriptions.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      user: PropTypes.string,
    }).isRequired,
    path: PropTypes.string,
  }),
  updateCurrentUser: PropTypes.func,
  currentUser: PropTypes.shape({
    id: PropTypes.number,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
};

export default Subscriptions;
