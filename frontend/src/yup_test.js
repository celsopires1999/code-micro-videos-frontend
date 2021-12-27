// import * as yup from 'yup'; // es6
const yup = require('yup'); //commonjs

const schema = yup.object().shape({
    name: yup
        .string()
        .required(),
    num: yup
        .number(),
    categories_id: yup
        .array()
        .min(1)
        .required(),
});

schema.isValid({name: 'a', num: "2", categories_id: []})
        .then(isValid => console.log('==>> isvalid - then: ', isValid))
        .catch(errors => console.log('==>> isvalid - catch: ', errors));

schema.validate({name: 'a', num: "2",  categories_id: []})
        .then(valid => console.log('==>> validate - then: ', valid))
        .catch(errors => console.log('==>> validate - catch: ', errors));

