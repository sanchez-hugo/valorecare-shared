import * as Yup from "yup";

const LocationSchema = Yup.object().shape({
  locationTypeId: Yup.string().required(),
  lineOne: Yup.string().required("This field is required."),
  lineTwo: Yup.string(),
  city: Yup.string().required("This field is required."),
  stateId: Yup.string().required("This field is required."),
  zip: Yup.string().required("This field is required."),
});
export default LocationSchema;
