const { createStore, applyMiddleware } = require("redux");

function reducer(state, action) {
    // console.log('reducer => state: ', state);
    // console.log('reducer => action ', action);
    return { value: action.value };
}

const customMiddleware = store => next => action => {
    // console.log('customMiddleware => store: ', store);
    // console.log('customMiddleware => next: ', next);
    // console.log('customMiddleware => action: ', action);

    // console.log('Hello World from customMiddleware');

    if (action.type === 'acaoY') {
        next({ type: action.type, value: 'mudou no middleware' });
    } else {
        next(action);
    }
};

const store = createStore(
    reducer,
    applyMiddleware(customMiddleware)
);

const action = (type, value) => store.dispatch({ type, value });
action('acaoX', 'a');
console.log(store.getState());

action('acaoY', 'a');
console.log(store.getState());
