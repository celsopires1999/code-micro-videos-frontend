import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "@redux-saga/core";
import upload from "./upload";
import rootSaga from "./root-saga";

const sagaMiddleware = createSagaMiddleware();
const store = createStore(
    combineReducers({
        upload
    }),
    applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(rootSaga);

export default store;
