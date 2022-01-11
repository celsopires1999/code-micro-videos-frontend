// import {CreatedActions} from 'reduxsauce'; //ES6
const {createActions} = require('reduxsauce'); //commonjs

// const createdActions = createActions({
//     addParam: ['payload'],
//     removeParam: ['id']
// });
// console.log(createdActions);

const {Types, Creators} = createActions({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
});

console.log(Types, Creators);
console.log(Creators.setSearch({search: 'teste'}));
