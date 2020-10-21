/*global google*/
//^ this will declare to eslint that google is a global name
// and will be available at runtime.
import React from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
} from "react-places-autocomplete";
import PropTypes from "prop-types";

const SearchLocationFormik = ({
  field,
  form,
  getAddress,
  updateAddress,
  currentAddress,
  placeholder,
}) => {
  const handleChange = (address) => {
    updateAddress(address);
  };

  const handleSelect = (address) => {
    geocodeByAddress(address).then((results) => getAddress(results[0]));
  };

  const searchOptions = {
    bounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(34, -116),
      new google.maps.LatLng(44, -69)
    ),
    types: ["address"],
  };

  const handleBlur = () => {
    form.setFieldTouched(field.name, true);
  };

  return (
    <PlacesAutocomplete
      value={currentAddress}
      onChange={handleChange}
      onSelect={handleSelect}
      searchOptions={searchOptions}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div onBlur={handleBlur}>
          <input
            {...getInputProps({
              placeholder: `${placeholder}`,
              className: "location-search-input form-control",
            })}
          />
          <div className="autocomplete-dropdown-container">
            {loading && <div>Loading...</div>}
            {suggestions.map((suggestion, index) => {
              const className = suggestion.active
                ? "suggestion-item--active"
                : "suggestion-item";
              // inline style for demonstration purpose
              const style = suggestion.active
                ? { backgroundColor: "#fafafa", cursor: "pointer" }
                : { backgroundColor: "#ffffff", cursor: "pointer" };
              return (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className,
                    style,
                  })}
                  key={index}
                >
                  <span>{suggestion.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default SearchLocationFormik;

SearchLocationFormik.propTypes = {
  getAddress: PropTypes.func.isRequired,
  updateAddress: PropTypes.func.isRequired,
  currentAddress: PropTypes.string.isRequired,
  field: PropTypes.shape({
    value: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
    setFieldTouched: PropTypes.func.isRequired,
    setFieldError: PropTypes.func.isRequired,
  }).isRequired,
  placeholder: PropTypes.string.isRequired,
};
