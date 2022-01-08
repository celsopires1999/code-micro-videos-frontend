import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useRef, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table';
import FilterResetButton from '../../components/Table/FilterResetButton';
import reducer, { INITIAL_STATE, Creators } from '../../store/search';
import categoryHttp from '../../util/http/category-http';
import { Category, ListResponse } from '../../util/models';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
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
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />;
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        },
    },
    {
        name: "actions",
        label: "Ações",
        width: "13%",
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    },
];

const Table = () => {
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    const [searchState, dispatch] = useReducer(reducer, INITIAL_STATE);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    useEffect(() => {
        subscribed.current = true
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order.sort,
        searchState.order.dir,
    ]);

    async function getData() {
        setLoading(true);
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: cleanSearchText(searchState.search),
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page,
                    sort: searchState.order.sort,
                    dir: searchState.order.dir,
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (categoryHttp.isCancelledRequest(error)) {
                return;
            }
            enqueueSnackbar(
                `Não foi possível encontrar as informações`,
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }

    function cleanSearchText(text) {
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText;
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title=""
                columns={columnsDefinition}
                data={data}
                loading={loading}
                debouncedSearchTime={500}
                options={{
                    serverSide: true,
                    searchText: searchState.search as any, 
                    page: searchState.pagination.page - 1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => {
                                dispatch(Creators.setReset())
                            }}
                        />
                    ),
                    onSearchChange: (value) => dispatch(Creators.setSearch({ search: value as any })), //ver se preciso desse as any
                    onChangePage: (page) => dispatch(Creators.setPage({ page: page + 1 })),
                    onChangeRowsPerPage: (perPage) => dispatch(Creators.setPerPage({ per_page: perPage })),
                    onColumnSortChange: (changedColumn: string, direction: 'asc' | 'desc') =>
                        dispatch(Creators.setOrder({
                            sort: changedColumn,
                            dir: direction.includes('desc') ? 'desc' : 'asc',
                        })),
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
