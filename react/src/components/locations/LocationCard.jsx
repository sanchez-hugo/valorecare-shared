import React from "react";
import PropTypes from "prop-types";
import logger from "sabio-debug";
// import { Col, Card, CardBody, CardText, Button } from "reactstrap";
import { buildAddress } from "../../services/utilityService";
import LocationsMap from "./LocationsMap";

//import LocationsMap from "./LocationsMap";
const _logger = logger.extend("LocationCard");

const LocationCard = (props) => {
  const onEditClicked = () => {
    _logger("edit button");
    props.onEditLocationsRequest(props.location);
  };
  const address = buildAddress(props.location);

  _logger(props.location);
  return (
    <div className="col-md-4">
      <div className="mb-5 card ml-3 mt-2 mr-3">
        <LocationsMap location={props.location} />
        <div className="card-body">
          <h5 className="card-title  font-size-md text-center">{address}</h5>

          <button type="button" onClick={onEditClicked}>
            <i className="fa fa-edit" />
          </button>
        </div>
      </div>
    </div>
  );
};
LocationCard.propTypes = {
  location: PropTypes.shape({
    id: PropTypes.number.isRequired,
    locationType: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    }),
    lineOne: PropTypes.string.isRequired,
    lineTwo: PropTypes.string.isRequired,
    longitude: PropTypes.number.isRequired,
    latitude: PropTypes.number.isRequired,
    city: PropTypes.string.isRequired,
    zip: PropTypes.string.isRequired,
    stateId: PropTypes.number,
  }),
  history: PropTypes.shape({
    history: PropTypes.func,
    push: PropTypes.func.isRequired,
  }),
  onEditLocationsRequest: PropTypes.func,
};
export default LocationCard;
