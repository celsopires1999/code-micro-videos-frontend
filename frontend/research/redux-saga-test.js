const { createStore, applyMiddleware } = require("redux");
const { default: createSagaMiddleware } = require("redux-saga");
const { take, put, call, actionChannel, debounce, select, all, fork } = require("redux-saga/effects");
const axios = require("axios");

function reducer(state = { value: 1 }, action) {
    console.log('reducer.action: ', action)
    if (action.type === 'acaoY') {
        return { ...state, text: action.value };
    }
    if (action.type === 'acaoX') {
        return { value: action.value }
    }
    return state;
}

function* sagaNonBlocking() {
    console.log('sagaNonBlocking.antes chamada da API');
    try {
        const {data} = yield call(() => axios.get('http://nginx/api/genres?search=a'));
        console.log ('sagaNonBlocking.data: ', data);
    } catch (error) {
        console.error(error);
    }
    console.log('sagaNonBlocking.depois chamada da API');
}

function* searchData(action) {
    console.log('searchData.state.text: ', yield select((state) => state.text));
    console.log('searchData.state.value: ', yield select((state) => state.value));
    const search = action.value;

    yield fork (sagaNonBlocking);
    console.log('searchData.antes do effect all');
    try {
        const [response1, response2] = yield all([
            call(() => axios.get('http://nginx/api/videos?search=' + search)),
            call(() => axios.get('http://nginx/api/categories?search=' + search))
        ]);

        // console.log('searchData: ', JSON.stringify(response1.data), JSON.stringify(response2.data));
        console.log('searchData: ', response1.data.data.length, response2.data.data.length);

        // const { data1 } = yield call(() => axios.get('http://nginx/api/videos?search=' + search));
        // const { data2 } = yield call(() => axios.get('http://nginx/api/categories?search=' + search));
        console.log('searchData.search:  ' + search);
        yield put({
            type: 'acaoX',
            value: response1.data
        });
    } catch (error) {
        yield put({
            type: 'acaoX',
            value: error
        });
    }
}

function* debounceSearch() {
    console.log('debounceSearch.antes')
    yield debounce(1000, 'acaoY', searchData)
    console.log('debounceSearch.depois')
}

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
    reducer,
    applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(debounceSearch);

const action = (type, value) => store.dispatch({ type, value });

action('acaoY', 'a');
// action('acaoY', 'c');
// action('acaoY', 'ce');
// action('acaoY', 'cel');
// action('acaoY', 'cels');
// action('acaoY', 'celso');
// action('acaoY', 'celso p');
// action('acaoY', 'celso pi');
// action('acaoY', 'celso pir');
// action('acaoY', 'celso pire');
// action('acaoY', 'celso pires');

console.log('store.getState(): ', store.getState());
