// import * as yup from 'yup'; // es6
const yup = require('yup'); //commonjs

const schema = yup.object().shape({
    name: yup
        .string()
        .required(),
    num: yup
        .number(),
});

schema.isValid({name: 'a', num: "2a"})
        .then(isValid => console.log('==>> isvalid - then: ', isValid))
        .catch(errors => console.log('==>> isvalid - catch: ', errors));

schema.validate({name: 'a', num: "2a"})
        .then(valid => console.log('==>> validate - then: ', valid))
        .catch(errors => console.log('==>> validate - catch: ', errors));

