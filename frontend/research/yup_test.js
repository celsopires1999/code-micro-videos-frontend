// import * as yup from 'yup'; // es6
const yup = require('yup'); //commonjs

function testForm() {

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

    schema.isValid({ name: 'a', num: "2", categories_id: [] })
        .then(isValid => console.log('==>> isvalid - then: ', isValid))
        .catch(errors => console.log('==>> isvalid - catch: ', errors));

    schema.validate({ name: 'a', num: "2", categories_id: [] })
        .then(valid => console.log('==>> validate - then: ', valid))
        .catch(errors => console.log('==>> validate - catch: ', errors));

}

const columns = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "43%",
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
    },
    {
        name: "actions",
        label: "Ações",
        width: "13%",
    },
];

function testQueryString() {

    const schema = yup.object().shape({
        search: yup.string()
            .transform(value => !value ? undefined : value)
            .default(''),
        pagination: yup.object().shape({
            page: yup.number()
                .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                .default(1),
            per_page: yup.number()
                .oneOf([10, 15, 100])
                .transform(value => isNaN(value) ? undefined : value)
                .default(15),
        }),
        order: yup.object().shape({
            sort: yup.string()
                .nullable()
                .transform(value => {
                    const columnsName = columns
                        .filter(column => !column.options || column.options.sort !== false)
                        .map(column => column.name)
                    return columnsName.includes(value) ? value : undefined
                })
                .default(null),
            dir: yup.number()
                .nullable()
                .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                .default(null),
        }),
        
    });

    console.log(schema.cast({
        pagination: {
            page: 1.1
        }
    }));
}

testQueryString();
