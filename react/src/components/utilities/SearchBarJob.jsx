import React, { useState } from "react";
import PropTypes from "prop-types";
import { searchJobsNearby } from "../../services/jobService";
import { zipValidationSchema } from "../providers/ZipValidationSchema";
import { Field, Form, Formik } from "formik";

import debug from "sabio-debug";
const _logger = debug.extend("Jobs");

const SearchBarJob = ({ pageIndex, pageSize, onJobSearchSuccess }) => {
  const submitInitialSearch = (values) => {
    searchJobsNearby(
      pageIndex,
      pageSize,
      values.query,
      Math.ceil(Number(values.radius) * 1609.344),
      values.zip
    )
      .then(onSearchSuccess)
      .catch(onSearchError);
  };

  const onSearchError = (response) => {
    _logger("Error Getting providers", response);
  };

  const onSearchSuccess = (response) => {
    _logger("Success Getting Jobs", response);
    onJobSearchSuccess(response);
  };

  const [search] = useState({ query: "", zip: "", radius: "" });

  return (
    <>
      <div>
        <Formik
          className="zip-form top-form-zip"
          enableReinitialize={true}
          validationSchema={zipValidationSchema}
          initialValues={search}
          onSubmit={(values, { resetForm }) => {
            _logger("values:", values);
            submitInitialSearch(values);
            resetForm({
              query: "",
              zip: "",
              radius: "",
            });
          }}
        >
          {(props) => (
            <Form className="form-inline">
              {props.errors.query && (
                <div id="invalid-feedback">{props.errors.query}</div>
              )}
              {props.errors.zip && <div id="feedback">{props.errors.zip}</div>}

              {props.errors.radius && (
                <div id="invalid-feedback">{props.errors.radius}</div>
              )}
              <div className="form-group">
                <Field
                  name="query"
                  type="text"
                  className="form-control radius-field ml-2"
                  placeholder="Keyword"
                />
                {/* <div className="invalid-feedback">
        Please provide a valid city.
      </div> */}

                <Field
                  name="zip"
                  type="text"
                  className="form-control zip-field ml-2"
                  placeholder="Zip Code"
                />

                <Field
                  name="radius"
                  type="text"
                  className="form-control radius-field ml-2"
                  placeholder="Radius In Miles"
                />

                <button
                  type="submit"
                  className="submit-button btn btn-primary zip-submit-side ml-2"
                >
                  Search
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

SearchBarJob.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default SearchBarJob;
