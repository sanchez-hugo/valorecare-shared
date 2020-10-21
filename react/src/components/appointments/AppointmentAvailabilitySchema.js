import * as Yup from "yup";

const appointmentAvailabilitySchema = Yup.object().shape({
    day: Yup.date().min(new Date()).required(),
    startTime: Yup.number().min(1, "Enter a Start Time").required(),
    endTime: Yup.number().min(1, "Enter an End Time").required(),
});

export {
    appointmentAvailabilitySchema
};