import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import StripeLogo from "../../assets/images/stripe-blue-on-dark.png";
import { STRIPE_CLIENT_KEY, getAccountId } from "../../services/connectService";
import { isRoleOf } from "../../services/utilityService";

const clientKey = STRIPE_CLIENT_KEY;
const clientState = "CHECK_USER";

class ConnectSignUpButton extends PureComponent {
  state = {
    accountId: "",
    callMade: false,
  };

  componentDidMount() {
    if (isRoleOf(this.props.currentUser.roles, "Provider")) {
      getAccountId()
        .then(this.onGetAccountSuccess)
        .catch(this.onGetAccountError);
    }
  }

  onGetAccountSuccess = (response) => {
    const accountId = response.item;
    const callMade = true;
    this.setState((prevState) => ({ ...prevState, accountId, callMade }));
  };

  onGetAccountError = () => {
    const callMade = true;
    this.setState((prevState) => ({ ...prevState, callMade }));
  };

  render() {
    const email = this.props.currentUser.email;
    const url = `https://connect.stripe.com/express/oauth/authorize?client_id=${clientKey}&state=${clientState}&suggested_capabilities[]=transfers&stripe_user[email]=${email}`;

    if (isRoleOf(this.props.currentUser.roles, "Provider")) {
      // if that call hasnt been made dont show anything
      if (!this.state.callMade) return null;
      else {
        if (this.state.accountId) return null;
        else
          return (
            <div className="nav-link">
              <a href={url}>
                <img
                  className="btn"
                  src={StripeLogo}
                  alt="Connect With Stripe"
                />
              </a>
            </div>
          );
      }
    } else return null;
  }
}

ConnectSignUpButton.propTypes = {
  currentUser: PropTypes.shape({
    roles: PropTypes.instanceOf(Array),
    email: PropTypes.string.isRequired,
  }).isRequired,
};

export default ConnectSignUpButton;
