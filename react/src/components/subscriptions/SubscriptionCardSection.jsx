import React from "react";
import { CardElement } from "@stripe/react-stripe-js";
import "./CardSectionStyles.css";
import PropTypes from "prop-types";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const CardSection = ({ onChange }) => {
  return (
    <div>
      Card Details
      <CardElement
        onChange={onChange}
        id="card"
        name="card"
        options={CARD_ELEMENT_OPTIONS}
      />
    </div>
  );
};

CardSection.propTypes = {
  onChange: PropTypes.func.isRequired,
};

export default CardSection;
