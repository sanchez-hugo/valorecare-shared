import React from "react";
import { Modal, ModalBody } from "reactstrap";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";
import { TextField } from "formik-material-ui";

const AppointmentEmailModal = (props) => {
  const validationSchema = Yup.object().shape({
    subject: Yup.string()
      .min(3, "Too Short")
      .max(255, "Too Long")
      .required("Please Add A Subject"),
    message: Yup.string()
      .min(10, "Too Short")
      .max(2000, "Too Long")
      .required("Required"),
  });
  return (
    <React.Fragment>
      <Modal isOpen={props.isOpen} toggle={props.toggleModal}>
        <ModalBody>
          <Formik
            className="contact-form"
            enableReinitialize={true}
            validationSchema={validationSchema}
            initialValues={{ subject: "", message: "" }}
            onSubmit={(values, { resetForm }) => {
              props.sendEmail(values);
              resetForm({
                subject: "",
                message: "",
              });
            }}
          >
            {(formikProps) => (
              <Form>
                <div className="input-field">
                  <Field
                    component={TextField}
                    name="subject"
                    type="text"
                    fullWidth
                    placeholder="Subject"
                    label="Subject"
                  />
                </div>
                <div className="input-field">
                  <Field
                    component={TextField}
                    name="message"
                    type="text"
                    fullWidth
                    placeholder="Send A Message"
                    label="Message"
                    variant="outlined"
                    multiline
                    rows={8}
                  />
                </div>
                <div className="input-field submit">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block submit"
                    disabled={!formikProps.isValid}
                  >
                    Send
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};
AppointmentEmailModal.propTypes = {
  isOpen: PropTypes.bool,
  toggleModal: PropTypes.func,
  sendEmail: PropTypes.func,
};

export default AppointmentEmailModal;
