import * as Yup from "yup";


const jobValidationSchema = Yup.object().shape({
    query: Yup.string().min(1, 'Please Enter a Search Term').required('Required'),
    zip: Yup.string().matches(/^[0-9]{5}$/, 'Must be exactly 5 digits').required('Required'),
    radius: Yup.string().matches(/^(0|[1-9]\d*)(\.\d+)?$/, 'Must be a number').required('Required'),
});

export {
    jobValidationSchema
};