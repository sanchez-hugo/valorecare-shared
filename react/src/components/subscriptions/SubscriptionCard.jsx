import React from "react";
import PropTypes from "prop-types";
import {
  buildDateShort,
  convertCostToString,
  swalConfirm,
} from "../../services/utilityService";

const SubscriptionCard = ({
  subscription,
  cancelSubscription,
  editPlan,
  editPaymentMethod,
  hasMorePlans,
}) => {
  const onCancelClick = () => {
    // swalTitle, swalText, callback, id
    const title = "Are you sure you want to cancel?";
    const text = "Your subscription will end immediately.";
    const id = subscription.id;
    swalConfirm(title, text, cancelSubscription, id);
  };

  const onEditPlanClick = () => {
    const title = "Are you sure you want to edit?";
    const text = "Your subscription will change immediately.";
    // TODO
    swalConfirm(title, text, editPlan, subscription);
  };

  const onEditPaymentMethodClick = () => {
    const title = "Are you sure you want to change payment method?";
    const text = "Your new card won't be charged until next period.";
    // TODO change subitem to sub and follow path
    swalConfirm(title, text, editPaymentMethod, subscription);
  };

  const buildPriceStatement = (plan) => {
    const price = convertCostToString(plan.amount);
    const interval = plan.interval;
    const intervalCount = plan.intervalCount;
    let priceStatement = "";

    if (intervalCount === 1) priceStatement = `${price} / ${interval}`;
    else if (intervalCount > 1)
      priceStatement = `${price} / ${intervalCount} ${interval}s`;
    return priceStatement;
  };

  const buildPaymentStatement = (card) => {
    let brand = card.brand;
    brand = brand.charAt(0).toUpperCase() + brand.slice(1);
    const statement = `${brand} ending in ${card.last4}`;
    return statement;
  };

  const plan = subscription.plan;
  const title = plan.nickname;
  const card = subscription.defaultPaymentMethod.card;
  const priceStatement = buildPriceStatement(plan);
  const paymentStatement = buildPaymentStatement(card);
  const subscriptionStartDate = buildDateShort(subscription.startDate);
  const currentPeriodStart = buildDateShort(subscription.currentPeriodStart);
  const currentPeriodEnd = buildDateShort(subscription.currentPeriodEnd);

  return (
    <div className="col-sm-10 col-md-8 col-lg-6 p-1">
      <div className="card rounded-lg h-100">
        <div className="card-body mt-3 mx-3 mb-0 p-0 p-3">
          <div className="h4 mb-3">Subscription</div>
          <div className="d-flex">
            <div>Current plan:</div>
            <div className="ml-auto">{title}</div>
          </div>
          <div className="d-flex">
            <div>Current pricing:</div>
            <div className="ml-auto">{priceStatement}</div>
          </div>
          <div className="d-flex">
            <div>Payment Method:</div>
            <div className="ml-auto">{paymentStatement}</div>
          </div>
          <div className="mt-3 container">
            {hasMorePlans ? (
              <div className="row">
                <button
                  title="Change your plan"
                  data-toggle="tooltip"
                  data-placement="bottom"
                  className="mt-2 btn btn-link text-secondary"
                  onClick={onEditPlanClick}
                >
                  Change pricing plan →
                </button>
              </div>
            ) : null}
            <div className="row">
              <button
                title="Change your payment card"
                data-toggle="tooltip"
                data-placement="bottom"
                className="mt-2 btn btn-link text-secondary"
                onClick={onEditPaymentMethodClick}
              >
                Edit Payment Method →
              </button>
            </div>
            <div className="row">
              <button
                title="Cancel this subscription"
                data-toggle="tooltip"
                data-placement="bottom"
                className="mt-2 btn btn-link text-secondary"
                onClick={onCancelClick}
              >
                Cancel subscription →
              </button>
            </div>
          </div>
          {subscription.status === "incomplete" ? (
            <div className="text-center text-danger">
              Your subscription is incomplete. Please edit your payment method.
            </div>
          ) : null}
        </div>
        <div className="card-footer mt-0">
          <div className="d-flex px-3">
            <div>
              <small>Been a member since:</small>
            </div>
            <div className="ml-auto">
              <small>{subscriptionStartDate}</small>
            </div>
          </div>
          <div className="d-flex px-3">
            <div>
              <small>Current period started on:</small>
            </div>
            <div className="ml-auto">
              <small>{currentPeriodStart}</small>
            </div>
          </div>
          <div className="d-flex px-3">
            <div>
              <small>Current period ends on:</small>
            </div>
            <div className="ml-auto">
              <small>{currentPeriodEnd}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

SubscriptionCard.propTypes = {
  subscription: PropTypes.shape({
    id: PropTypes.string,
    startDate: PropTypes.string,
    currentPeriodEnd: PropTypes.string,
    currentPeriodStart: PropTypes.string,
    status: PropTypes.string,
    defaultPaymentMethod: PropTypes.shape({
      card: PropTypes.shape({
        brand: PropTypes.string,
      }),
    }),
    items: PropTypes.instanceOf(Array),
    plan: PropTypes.shape({
      created: PropTypes.string,
      nickname: PropTypes.string,
    }),
  }),
  cancelSubscription: PropTypes.func,
  editPaymentMethod: PropTypes.func,
  editPlan: PropTypes.func,
  hasMorePlans: PropTypes.bool,
};

export default SubscriptionCard;
