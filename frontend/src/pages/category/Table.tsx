import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useRef, useContext, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import DeleteDialog from '../../components/DeleteDialog';
import LoadingContext from '../../components/loading/LoadingContext';
import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import FilterResetButton from '../../components/Table/FilterResetButton';
import useDeleteCollection from '../../hooks/useDeleteCollections';
import useFilter from '../../hooks/useFilter';
import categoryHttp from '../../util/http/category-http';
import { Category, ListResponse } from '../../util/models';
import * as yup from '../../util/vendor/yup';

const isActive = { 'Sim': true, 'Não': false };

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
        name: "name",
        label: "Nome",
        width: "43%",
        options: {
            filter: false
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        width: "4%",
        options: {
            filterOptions: {
                names: Object.keys(isActive)
            },
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

const debouncedTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];

const Table = () => {
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const loading = useContext(LoadingContext);
    const { enqueueSnackbar } = useSnackbar();
    const { openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete } = useDeleteCollection();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const extraFilter = useMemo(() => ({
        createValidationsSchema: () => {
            return yup.object().shape({
                is_active: yup.string()
                    .nullable()
                    .transform(value => {
                        return !value || !Object.keys(isActive).includes(value) ? undefined : value;
                    })
                    .default(null)
            })
        },
        formatSearchParams: (debouncedFilterState) => {
            return debouncedFilterState.extraFilter
                ? {
                    ...(
                        debouncedFilterState.extraFilter.is_active &&
                        { is_active: debouncedFilterState.extraFilter.is_active }
                    )
                }
                : undefined
        },
        getStateFromURL: (queryParams) => {
            return {
                is_active: queryParams.get('is_active')
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

    const indexColumnIsActive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsActive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : []

    const getData = useCallback(async ({ search, page, per_page, sort, dir, is_active }) => {
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    is_active
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
            if (categoryHttp.isCancelledRequest(error)) {
                return;
            }
            enqueueSnackbar(
                `Não foi possível encontrar as informações`,
                { variant: 'error' }
            );
        }
    }, [enqueueSnackbar, openDeleteDialog, setOpenDeleteDialog, setTotalRecords]);

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
                debouncedFilterState?.extraFilter?.is_active &&
                { is_active: isActive[debouncedFilterState.extraFilter.is_active] }
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
        categoryHttp
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
                            debouncedFilterState?.extraFilter?.is_active &&
                            { is_active: isActive[debouncedFilterState.extraFilter.is_active] }
                        )
                    });
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
                        const columnLocal = !column ? 'is_active' : column
                        const columnIndex = columns.findIndex(c => c.name === columnLocal);
                        filterManager.changeExtraFilter({
                            [columnLocal]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
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
