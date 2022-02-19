import LoadingContext from "./LoadingContext";
import { useMemo, useState } from "react";
import {
    addGlobalRequestInterceptor, addGlobalResponseInterceptor,
    removeGlobalRequestInterceptor, removeGlobalResponseInterceptor
} from "../../util/http";

const LoadingProvider = (props) => {
    const [loading, setLoading] = useState<boolean>(false);
    //useMemo vs useCallback
    useMemo(() => {
        let isSubscribed = true;
        // axios.interceptors.request.use();
        const requestIds = addGlobalRequestInterceptor((config) => {
            if (isSubscribed) { setLoading(true) };
            return config;
        });
        // axios.interceptors.response.use();
        const responseIds = addGlobalResponseInterceptor((response) => {
            if (isSubscribed) { setLoading(false) };
            return response;
        },
            (error) => {
                if (isSubscribed) { setLoading(false) };
                return Promise.reject(error);
            });
        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestIds);
            removeGlobalResponseInterceptor(responseIds);
        }
    }, [true]);
    return (
        <LoadingContext.Provider value={loading} >
            {props.children}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;
