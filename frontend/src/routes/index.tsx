import { RouteProps } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Category from "../pages/category/List"

interface MyRouteProps extends RouteProps {
    label: string;
}

const routes: MyRouteProps[] = [
    {
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        label: 'Listar categorias',
        path: '/categories',
        component: Category,
        exact: true
    },
];

export default routes;
