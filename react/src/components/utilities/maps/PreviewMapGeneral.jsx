import React, { useState } from "react";
import GoogleMapReact from "google-map-react";
import MarkerPin from "./MarkerPin";
import PropTypes from "prop-types";
import { GOOGLE_MAP_KEY } from "../../../services/locationService";

const PreviewMapGeneral = (props) => {
  const getMapOptions = () => {
    const options = {
      disableDefaultUI: true,
      mapTypeControl: true,
      streetViewControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },
      ],
    };

    if (props.isAddressHidden) options.maxZoom = 13;

    return options;
  };
  //useState allows for use of state in a functional component
  const [center] = useState({
    lat: props.location.latitude,
    lng: props.location.longitude,
  });

  let updateCenter = {
    lat: props.location.latitude,
    lng: props.location.longitude,
  };

  const [zoom] = useState(10);
  return (
    <div
      style={{
        height: "50vh",
        width: "100%",
      }}
    >
      <GoogleMapReact
        bootstrapURLKeys={{ key: GOOGLE_MAP_KEY, libraries: ["visualization"] }}
        defaultCenter={center}
        center={updateCenter}
        defaultZoom={zoom}
        options={getMapOptions}
      >
        <MarkerPin
          lat={props.location.latitude}
          lng={props.location.longitude}
          isAddressHidden={props.isAddressHidden}
        />
      </GoogleMapReact>
    </div>
  );
};
PreviewMapGeneral.propTypes = {
  location: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  isAddressHidden: PropTypes.bool.isRequired,
};

PreviewMapGeneral.defaultProps = {
  isAddressHidden: false,
};

export default PreviewMapGeneral;
