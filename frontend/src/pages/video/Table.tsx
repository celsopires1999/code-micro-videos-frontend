import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import DeleteDialog from '../../components/DeleteDialog';
import LoadingContext from '../../components/loading/LoadingContext';
import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import FilterResetButton from '../../components/Table/FilterResetButton';
import useDeleteCollection from '../../hooks/useDeleteCollections';
import useFilter from '../../hooks/useFilter';
import categoryHttp from '../../util/http/category-http';
import genreHttp from '../../util/http/genre-http';
import videoHttp from '../../util/http/video-http';
import { Video, ListResponse } from '../../util/models';
import * as yup from '../../util/vendor/yup';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "title",
        label: "Título",
        width: "20%",
        options: {
            filter: false
        }
    },
    {
        name: "genres",
        label: "Gêneros",
        width: "15%",
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
        name: "categories",
        label: "Categorias",
        width: "12%",
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
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            filter: false,
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
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const { enqueueSnackbar } = useSnackbar();
    const { openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete } = useDeleteCollection();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

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
        extraFilter: {
            createValidationsSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',')
                        })
                        .default(null),
                    genres: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',')

                        })
                        .default(null),
                })
            },
            formatSearchParams: (debouncedFilterState) => {
                return debouncedFilterState.extraFilter
                    ? {
                        ...(
                            debouncedFilterState.extraFilter.categories &&
                            { categories: debouncedFilterState.extraFilter.categories.join(',') }
                        ),
                        ...(
                            debouncedFilterState.extraFilter.genres &&
                            { genres: debouncedFilterState.extraFilter.genres.join(',') }
                        )
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    categories: queryParams.get('categories'),
                    genres: queryParams.get('genres')
                }
            }
        },
    });

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories as never;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];

    const indexColumnGenres = columns.findIndex(c => c.name === 'genres');
    const columnGenres = columns[indexColumnGenres];
    const genresFilterValue = filterState.extraFilter && filterState.extraFilter.genres as never;
    (columnGenres.options as any).filterList = genresFilterValue ? genresFilterValue : [];

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

    }, []);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const { data } = await genreHttp.list({ queryParams: { all: '' } });
                if (isSubscribed) {
                    (columnGenres.options as any).filterOptions.names = data.data.map(genre => genre.name);
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

    }, []);

    useEffect(() => {
        subscribed.current = true
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [
        cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        JSON.stringify(debouncedFilterState.extraFilter)
    ]);

    async function getData() {
        try {
            const { data } = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.categories &&
                        { categories: debouncedFilterState.extraFilter.categories.join(',') }
                    ),
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.genres &&
                        { genres: debouncedFilterState.extraFilter.genres.join(',') }
                    ),
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
                if (openDeleteDialog) { setOpenDeleteDialog(false) };
            }
        } catch (error) {
            console.error(error);
            if (videoHttp.isCancelledRequest(error)) {
                return;
            }
            enqueueSnackbar(
                `Não foi possível encontrar as informações`,
                { variant: 'error' }
            );
        }
    }
    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map(value => data[value.index].id)
            .join(',');
        videoHttp
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
                    getData()
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
                                filterManager.resetFilter();
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
