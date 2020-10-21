import React, { Component } from "react";
import { Row, Col } from "reactstrap";
// import PropTypes from "prop-types";
import "./AppointmentAvailability.css";
import ConnectCheckout2 from "../connect/ConnectCheckout2";
import ReactRouterPropTypes from "react-router-prop-types";

class AppointmentCheckout extends Component {
  state = {
    data: {
      userId: 1,
      hourlyRate: 1,
      apPrice: 1,
      providerId: 1,
      totalHours: 1,
      providerFirstName: "",
      providerLastName: "",
      apStart: "",
      apEnd: "",
    },
    noData: false,
  };
  componentDidMount() {
    const { state } = this.props.history.location;
    if (state) {
      this.setState((prevState) => {
        return { ...prevState, data: state };
      });
    } else {
      this.setState((prevState) => {
        return { ...prevState, noData: true };
      });
    }
  }

  onCheckoutSuccess = () => {
    const data = this.props.history.location.state;
    this.props.history.push(
      `/appointment/${this.props.history.location.state.providerId}/confirmation`,
      data
    );
  };
  render() {
    return (
      <React.Fragment>
        <div className="center">
          <div className="conform-width">
            <h3>Details</h3>
            <div className="card">
              <Row>
                <Col lg="5" className="checkout-text">
                  <p>Caregiver:</p>
                  <p>HourlyRate</p>
                  <p>Appointment Start:</p>
                  <p>Appointment End:</p>
                  <p>Total Hours:</p>
                  <strong>Total:</strong>
                </Col>
                <Col lg="5" className="checkout-text2">
                  <p>
                    {this.state.data.providerFirstName}{" "}
                    {this.state.data.providerLastName}
                  </p>
                  <p>${this.state.data.hourlyRate}</p>
                  <p>{this.state.data.apStart.toString().substring(0, 21)}</p>
                  <p>{this.state.data.apEnd.toString().substring(0, 21)}</p>
                  <p>{this.state.data.totalHours} Hrs</p>
                  <strong>${this.state.data.apPrice}</strong>
                </Col>
              </Row>
            </div>
            <Row>
              <Col>
                <ConnectCheckout2
                  userId={this.props.history.location.state.userId}
                  providerId={this.props.history.location.state.providerId}
                  apStart={this.props.history.location.state.apStart}
                  apEnd={this.props.history.location.state.apEnd}
                  apPrice={this.props.history.location.state.apPrice}
                  onCheckoutSuccess={this.onCheckoutSuccess}
                />
              </Col>
            </Row>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AppointmentCheckout;

AppointmentCheckout.propTypes = {
  // history: PropTypes.shape({
  //   location: PropTypes.shape({
  //     state: PropTypes.shape({
  //       userId: PropTypes.number,
  //       hourlyRate: PropTypes.number,
  //       apPrice: PropTypes.number,
  //       providerId: PropTypes.number,
  //       totalHours: PropTypes.number,
  //       providerFirstName: PropTypes.string,
  //       providerLastName: PropTypes.string,
  //       apStart: PropTypes.instanceOf(Date),
  //       apEnd: PropTypes.instanceOf(Date),
  //     }),
  //   }),
  // }),
  history: ReactRouterPropTypes.history.isRequired,
};
