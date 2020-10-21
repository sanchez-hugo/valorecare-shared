import React, { useState } from "react";
import GoogleMapReact from "google-map-react";
import Marker from "./MarkerPin";
import PropTypes from "prop-types";

const LocationMap = (props) => {
  const getMapOptions = () => {
    return {
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
  };
  //useState allows for use of state in a functional component
  const [center] = useState({
    lat: props.location.latitude,
    lng: props.location.longitude,
  });
  const [zoom] = useState(11);
  return (
    // Important! Always set the container height explicitly
    <div style={{ height: `${props.height}vh`, width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyASUgxNOHFzT1QVWeL-2YVAu4kYTxnaTco" }}
        defaultCenter={center}
        defaultZoom={zoom}
        options={getMapOptions}
      >
        <Marker
          lat={props.location.latitude}
          lng={props.location.longitude}
          name="My Marker"
          color="blue"
        />
      </GoogleMapReact>
    </div>
  );
};
LocationMap.propTypes = {
  location: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  height: PropTypes.number,
};

LocationMap.defaultProps = {
  height: 60,
};
export default LocationMap;
