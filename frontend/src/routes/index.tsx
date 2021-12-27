import { RouteProps } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import CategoryList from "../pages/category/PageList";
import CategoryCreate from "../pages/category/PageForm";
import CastMemberList from "../pages/cast-member/PageList";
import CastMemberCreate from "../pages/cast-member/PageForm";
import GenreList from "../pages/genre/PageList";
import GenreCreate from "../pages/genre/PageForm";

export interface MyRouteProps extends RouteProps {
    name: string;
    label: string;
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'Listar categorias',
        path: '/categories',
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Criar categoria',
        path: '/categories/create',
        component: CategoryCreate,
        exact: true
    },
    {
        name: 'categories.edit',
        label: 'Editar categoria',
        path: '/categories/:id/edit',
        component: CategoryCreate,
        exact: true
    },
    {
        name: 'cast_members.list',
        label: 'Listar membros de elencos',
        path: '/cast-members',
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: 'Criar membro de elenco',
        path: '/cast-members/create',
        component: CastMemberCreate,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: 'Editar membro de elenco',
        path: '/cast-members/:id/edit',
        component: CastMemberCreate,
        exact: true
    },
    {
        name: 'genres.list',
        label: 'Listar gêneros',
        path: '/genres',
        component: GenreList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'Criar gêneros',
        path: '/genres/create',
        component: GenreCreate,
        exact: true
    },
    {
        name: 'genres.edit',
        label: 'Editar gêneros',
        path: '/genres/:id/edit',
        component: GenreCreate,
        exact: true
    },
];

export default routes;
