// import { useSnackbar } from 'notistack';
// import axios from 'axios';

// const useHttpHandled = () => {
//     const { enqueueSnackbar } = useSnackbar();
//     return async (request: Promise<any>) => {
//         try {
//             const { data } = await request;
//             return data;
//         } catch (error) {
//             if (!axios.isCancel(error)) {
//                 enqueueSnackbar(
//                     `Não foi possível carregar as informações`,
//                     { variant: 'error' }
//                 );
//             }
//             throw error;
//         }
//     }
// }

// export default useHttpHandled;
import { useSnackbar } from "notistack";
import axios from 'axios';
import { useCallback } from "react";

const useHttpHandled = () => {
    const { enqueueSnackbar } = useSnackbar(); //notistack
    return useCallback(async (request: Promise<any>) => {
        try {
            const { data } = await request;
            return data;
        } catch (e) {
            console.error(e);
            if (!axios.isCancel(e)) {
                enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error', }
                );
            }
            throw e;
        }
    }, [enqueueSnackbar]);
};

export default useHttpHandled;