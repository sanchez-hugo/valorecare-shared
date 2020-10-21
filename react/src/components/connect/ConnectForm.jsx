import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import ConnectCheckout from "./ConnectCheckout";
import {
  toastSuccess,
  convertCostToString,
} from "../../services/utilityService";
import ConnectSignUpButton from "./ConnectSignUpButton";

class ConnectForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      chargeAmount: 2000, // needed for connect checkout
      appointmentId: 22, // needed for connect checkout
    };
  }

  // needed for connect checkout
  anySuccessHandler = () => {
    toastSuccess("Nice. Thanks.");
  };

  render() {
    return (
      <div className="container-fluid text-center">
        {/* Not needed for connect checkout */}
        <h1 className="display-5">Section 1: Sign Up for Connect</h1>
        <h1 className="display-7">might not see anything...</h1>
        <ConnectSignUpButton currentUser={this.props.currentUser} />
        <div className="my-5"></div>
        {/* Not needed for connect checkout */}
        <h1 className="display-5">Section 2: Paying a Provider</h1>
        <p>Your total is: {convertCostToString(this.state.chargeAmount)}</p>
        <ConnectCheckout
          chargeAmount={this.state.chargeAmount}
          onCheckoutSuccess={this.anySuccessHandler}
          appointmentId={this.state.appointmentId}
        />
      </div>
    );
  }
}

export default ConnectForm;

ConnectForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
};
