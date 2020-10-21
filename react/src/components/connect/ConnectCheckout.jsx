/* eslint-disable camelcase */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  Elements,
  ElementsConsumer,
  CardElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CardSection from "../checkout/CardSection";
import debug from "sabio-debug";
import { STRIPE_PUBLIC_KEY } from "../../services/paymentService";
import {
  createPaymentIntent,
  createCharge,
} from "../../services/connectService";
import { toastError } from "../../services/utilityService";

const _logger = debug.extend("CheckoutForm");

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

class ConnectCheckout extends PureComponent {
  state = {
    isProcessing: false,
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { stripe, elements } = this.props;

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make  sure to disable form submission until Stripe.js has loaded.
      return;
    }
    this.setIsProcessing(true);

    const options = {
      Amount: this.props.chargeAmount,
    };

    createPaymentIntent(options)
      .then(this.onCreatePaymentIntentSuccess)
      .then(this.confirmCardPayment)
      .catch(this.onCreatePaymentIntentError);
  };

  confirmCardPayment = async (clientSecret) => {
    const { stripe, elements } = this.props;

    const card = elements.getElement(CardElement);
    const data = {
      payment_method: {
        card,
      },
    };

    const confirmCardPaymentRequest = await stripe.confirmCardPayment(
      clientSecret,
      data
    );
    _logger({ confirmCardPaymentRequest });

    if (confirmCardPaymentRequest.error) {
      toastError(confirmCardPaymentRequest.error.message);
      this.setIsProcessing(false);
    } else {
      if (confirmCardPaymentRequest.paymentIntent.status === "succeeded") {
        const paymentIntentId = confirmCardPaymentRequest.paymentIntent.id;
        this.logAppointmentCharge(paymentIntentId);
      }
    }
  };

  logAppointmentCharge = (paymentIntentId) => {
    const stripeChargeGetRequest = {
      appointmentId: this.props.appointmentId,
      paymentIntentId,
    };
    createCharge(stripeChargeGetRequest)
      .then(this.onCreateChargeSuccess)
      .catch(this.onCreateChargeError);
  };

  onCreatePaymentIntentSuccess = (response) => {
    const clientSecret = response.item;
    _logger({ clientSecret });
    return clientSecret;
  };

  onCreatePaymentIntentError = (error) => {
    _logger({ error });
    toastError("Could not create a payment intent.");
    this.setIsProcessing(false);
  };

  onCreateChargeSuccess = () => {
    this.props.onCheckoutSuccess();
  };

  onCreateChargeError = (error) => {
    _logger({ error });
    toastError("Could not save your charge info. No refunds.");
    this.setIsProcessing(false);
  };

  setIsProcessing = (isProcessing) => {
    this.setState((prevState) => ({ ...prevState, isProcessing }));
  };

  render() {
    return (
      <form className="my-3" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <CardSection className="form-control" />
        </div>
        <button
          type="submit"
          className="btn btn-success my-2"
          disabled={this.state.isProcessing}
        >
          {this.state.isProcessing ? "Processing..." : "Confirm Payment"}
        </button>
        <div className="mt-3 text-center">
          <p>
            Your payment is securely processed by Stripe. Valorecare does not
            store your credit/debit card information.
          </p>
        </div>
      </form>
    );
  }
}

ConnectCheckout.propTypes = {
  appointmentId: PropTypes.number.isRequired,
  chargeAmount: PropTypes.number.isRequired,
  onCheckoutSuccess: PropTypes.func.isRequired,
  stripe: PropTypes.shape({
    confirmCardPayment: PropTypes.func,
    createPaymentMethod: PropTypes.func,
  }),
  elements: PropTypes.shape({ getElement: PropTypes.func }),
};

export default function InjectedCheckoutForm({ ...props }) {
  return (
    <Elements stripe={stripePromise} {...props}>
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <ConnectCheckout {...props} stripe={stripe} elements={elements} />
        )}
      </ElementsConsumer>
    </Elements>
  );
}
