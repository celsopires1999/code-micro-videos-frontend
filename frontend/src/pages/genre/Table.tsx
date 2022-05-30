import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import genreHttp from '../../util/http/genre-http';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Genre, ListResponse } from '../../util/models';
import DeleteDialog from '../../components/DeleteDialog';
import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import useFilter from '../../hooks/useFilter';
import useDeleteCollection from '../../hooks/useDeleteCollections';
import { useSnackbar } from 'notistack';
import * as yup from '../../util/vendor/yup';
import FilterResetButton from '../../components/Table/FilterResetButton';
import categoryHttp from '../../util/http/category-http';
import LoadingContext from '../../components/loading/LoadingContext';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
            filter: false,
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "10%",
        options: {
            filter: false
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "33%",
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: []
            },
            customBodyRender(value, tableMeta, updateValue) {
                return !value ? null : value.map(value => value.name).join(', ');
            }
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            filter: false,
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
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
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
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    },
];
const debouncedTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {
    const subscribed = useRef(true);
    const [data, setData] = useState<Genre[]>([]);
    const loading = useContext(LoadingContext);
    const { openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete } = useDeleteCollection();
    const { enqueueSnackbar } = useSnackbar();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => ({
        createValidationsSchema: () => {
            return yup.object().shape({
                categories: yup.mixed()
                    .nullable()
                    .transform(value => {
                        return !value || value === '' ? undefined : value.split(',')
                    })
                    .default(null)
            })
        },
        formatSearchParams: (debouncedFilterState) => {
            return debouncedFilterState.extraFilter
                ? {
                    ...(
                        debouncedFilterState.extraFilter.categories &&
                        { categories: debouncedFilterState.extraFilter.categories.join(',') }
                    )
                }
                : undefined
        },
        getStateFromURL: (queryParams) => {
            return {
                categories: queryParams.get('categories')
            }
        }
    }), []);
    const {
        columns,
        cleanSearchText,
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debouncedTime: debouncedTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter: extraFilter,
    });
    const searchText = cleanSearchText(debouncedFilterState.search);

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories as never;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];


    const getData = useCallback(async ({ search, page, per_page, sort, dir, categories }) => {
        try {
            const { data } = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    categories
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
                if (openDeleteDialog) {
                    setOpenDeleteDialog(false)
                };
            }
        } catch (error) {
            console.error(error);
            if (genreHttp.isCancelledRequest(error)) {
                return;
            }
            enqueueSnackbar(
                `Não foi possível encontrar as informações`,
                { variant: 'error' }
            );
        }
    }, [enqueueSnackbar, openDeleteDialog, setOpenDeleteDialog, setTotalRecords]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const { data } = await categoryHttp.list({ queryParams: { all: '' } });
                if (isSubscribed) {
                    (columnCategories.options as any).filterOptions.names = data.data.map(category => category.name);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    { variant: 'error', }
                )
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, [columnCategories.options, enqueueSnackbar]);

    useEffect(() => {
        subscribed.current = true
        getData({
            search: searchText,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
            ...(
                debouncedFilterState.extraFilter &&
                debouncedFilterState.extraFilter.categories &&
                { categories: debouncedFilterState.extraFilter.categories.join(',') }
            )
        });
        return () => {
            subscribed.current = false;
        }
    }, [
        getData,
        searchText,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        debouncedFilterState.extraFilter
    ]);

    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map(value => data[value.index].id)
            .join(',');
        genreHttp
            .deleteCollection({ ids })
            .then(response => {
                enqueueSnackbar(
                    'Registros excluídos com sucesso',
                    { variant: 'success' }
                );
                if (
                    rowsToDelete.data.length === filterState.pagination.per_page
                    && filterState.pagination.page > 1
                ) {
                    const page = filterState.pagination.page - 2;
                    filterManager.changePage(page);
                } else {
                    getData({
                        search: searchText,
                        page: debouncedFilterState.pagination.page,
                        per_page: debouncedFilterState.pagination.per_page,
                        sort: debouncedFilterState.order.sort,
                        dir: debouncedFilterState.order.dir,
                        ...(
                            debouncedFilterState.extraFilter &&
                            debouncedFilterState.extraFilter.categories &&
                            { categories: debouncedFilterState.extraFilter.categories.join(',') }
                        )
                    })
                }
            });
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows} />
            <DefaultTable
                title=""
                columns={columns}
                data={data}
                loading={loading}
                debouncedSearchTime={debouncedSearchTime}
                ref={tableRef}
                options={{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column: any, filterList, type) => {
                        const columnLocal = !column ? 'categories' : column
                        const columnIndex = columns.findIndex(c => c.name === columnLocal);
                        filterManager.changeExtraFilter({
                            [columnLocal]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => {
                                filterManager.resetFilter()
                            }}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted: {
                        lookup: { [dataIndex: number]: boolean };
                        data: Array<{ index: number; dataIndex: number }>;
                    }, newTableData: any[]) => {
                        setRowsToDelete(rowsDeleted as any);
                        return false;
                    }
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
