/* eslint-disable camelcase */
import React, { Component } from "react";
import { Row, Col } from "reactstrap";
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
import { addAppointment } from "../../services/appointmentService";
import Swal from "sweetalert2";

const _logger = debug.extend("CheckoutForm");

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

class ConnectCheckout2 extends Component {
  state = {
    isProcessing: false,
    appointmentId: null,
    checkboxState: false,
    mappedCheckbox: null,
  };

  componentDidMount() {
    this.setState((prevState) => {
      return { ...prevState, mappedCheckbox: this.mapCheckBox(false) };
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      seekerId: this.props.userId,
      providerId: this.props.providerId,
      price: this.props.apPrice,
      startTime: this.props.apStart,
      endTime: this.props.apEnd,
      isConfirmed: false,
      isCanceled: false,
      cancellationReason: "",
    };
    addAppointment(payload)
      .then(this.onSuccessAddAppointment)
      .catch(this.onErrorAddAppointment);
  };

  onSuccessAddAppointment = (response) => {
    _logger("appointment made. Id:", response.item);
    this.setState(
      (prevState) => {
        return { ...prevState, appointmentId: response.item };
      },
      () => this.handlePayment()
    );
  };

  onErrorAddAppointment = () => {
    toastError("Error: Appointment did not go through");
  };

  handlePayment = async () => {
    const { stripe, elements } = this.props;

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make  sure to disable form submission until Stripe.js has loaded.
      return;
    }
    this.setIsProcessing(true);

    const options = {
      Amount: this.props.apPrice * 100,
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
      appointmentId: this.state.appointmentId,
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

  onCreateChargeError = (response) => {
    _logger({ response });
    const errorMsg = response.response.data.errors[0].toString();
    toastError(errorMsg);
    this.setIsProcessing(false);
  };

  setIsProcessing = (isProcessing) => {
    this.setState((prevState) => ({ ...prevState, isProcessing }));
  };

  readTerms = () => {
    Swal.fire({
      title: "Terms & Conditions",
      text:
        "Even though we go to great lengths to verify and vet our caregivers, Valore Care does not directly employ or recommend any care recipient or caregiver. We simply provide the platform to help those needing care safely connect with caregivers online. By selecting a caregiver, you accept responsibility for the conduct of the caregiver of your choice. Should any matters arise, we appreciate a prompt notification to attempt a resolution.",
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  };

  toggleCheckbox = () => {
    const newValue = !this.state.checkboxState;
    const mapper = this.mapCheckBox(newValue);
    this.setState((prevState) => {
      return { ...prevState, checkboxState: newValue, mappedCheckbox: mapper };
    });
  };

  mapCheckBox = (newValue) => {
    return (
      <div className="form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="exampleCheck1"
          onChange={this.toggleCheckbox}
          checked={newValue}
        />
        <label className="form-check-label">
          By clicking this box, I accept the terms and conditions.
        </label>
      </div>
    );
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div>
          <Row>
            <Col className="terms-text">{this.state.mappedCheckbox}</Col>
          </Row>
          <Row>
            <Col className="center terms-button">
              <button
                type="button"
                className="btn btn-light"
                onClick={this.readTerms}
              >
                Read
              </button>
            </Col>
          </Row>
          <CardSection />
        </div>
        <div>
          <button
            type="submit"
            className="btn btn-lg btn-primary mt-2"
            disabled={
              this.state.isProcessing === true ||
              this.state.checkboxState === true
                ? false
                : true
            }
          >
            {this.state.isProcessing === true &&
            this.state.checkboxState === true
              ? "Processing..."
              : this.state.isProcessing === false &&
                this.state.checkboxState === false
              ? "Agree to Terms & Conditions"
              : "Confirm Payment"}
          </button>
        </div>
      </form>
    );
  }
}

ConnectCheckout2.propTypes = {
  onCheckoutSuccess: PropTypes.func,
  stripe: PropTypes.shape({
    confirmCardPayment: PropTypes.func,
    createPaymentMethod: PropTypes.func,
  }),
  elements: PropTypes.shape({ getElement: PropTypes.func }),
  userId: PropTypes.number,
  apPrice: PropTypes.number,
  providerId: PropTypes.number,
  apStart: PropTypes.instanceOf(Date),
  apEnd: PropTypes.instanceOf(Date),
};

export default function InjectedCheckoutForm({ ...props }) {
  return (
    <Elements stripe={stripePromise} {...props}>
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <ConnectCheckout2 {...props} stripe={stripe} elements={elements} />
        )}
      </ElementsConsumer>
    </Elements>
  );
}
