import React, { PureComponent } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import PropTypes from "prop-types";
import { jobNearbyValidationSchema } from "../../schemas/jobsNearbyValidationSchema";

class JobsNearbyForm extends PureComponent {
  state = {
    formData: {
      zip: "",
      radius: "",
    },
  };

  handleSubmit = (values) => {
    const newRadius = Math.ceil(Number(values.radius) * 1609.344);
    values.radius = newRadius;
    this.props.history.push(`/jobs`, values);
  };

  componentDidMount() {}

  render() {
    return (
      <Formik
        enableReinitialize={true}
        validationSchema={jobNearbyValidationSchema}
        initialValues={this.state.formData}
        onSubmit={this.handleSubmit}
      >
        {(props) => {
          const { values, touched, errors, handleSubmit, isValid } = props;
          return (
            <div className="container-fluid row justify-content-center mt-5 pt-5">
              <div className="pt-5 col-sm-6 col-lg-4">
                <div className="card border-rounded px-md-4">
                  <Form onSubmit={handleSubmit}>
                    <div className="card-body row justify-content-center">
                      <div className="font-weight-light h3 text-primary">
                        Search for Jobs
                      </div>
                    </div>
                    <div className="card-body px-md-4 pt-1 pb-4">
                      <Field
                        name="zip"
                        type="text"
                        value={values.zip}
                        placeholder="Zip Code"
                        className={
                          errors.zip && touched.zip
                            ? "form-control error is-invalid"
                            : "form-control"
                        }
                      />
                      <ErrorMessage
                        className="small error"
                        component="div"
                        name="zip"
                      />
                      <Field
                        name="radius"
                        type="text"
                        value={values.radius}
                        placeholder="Radius In Miles"
                        className={
                          errors.radius && touched.radius
                            ? "form-control error is-invalid"
                            : "form-control"
                        }
                      />
                      <ErrorMessage
                        className="small error"
                        component="div"
                        name="radius"
                      />
                    </div>
                    <div className="card-body pt-0">
                      <div className="row justify-content-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={
                            (!touched.zip && !touched.radius) || !isValid
                          }
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
    );
  }
}

JobsNearbyForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.object,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default JobsNearbyForm;
