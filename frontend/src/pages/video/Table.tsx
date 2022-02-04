import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import DefaultTable, { makeActionStyles, TableColumn, MuiDataTableRefComponent } from '../../components/Table';
import FilterResetButton from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
// import { Creators } from '../../store/filter';
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
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;

    const {
        columns,
        filterManager,
        filterState,
        debouncedFilterState,
        // dispatch,
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
        },
    });

    const indexColumnIsActive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsActive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : []
    // const serverSideFilterList = columns.map(column => []);
    // if (isActiveFilterValue) {
    //     serverSideFilterList[indexColumnIsActive] = [isActiveFilterValue];
    // }

    useEffect(() => {
        subscribed.current = true
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [
        filterManager.cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        JSON.stringify(debouncedFilterState.extraFilter)
    ]);

    async function getData() {
        setLoading(true);
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.is_active &&
                        { is_active: isActive[debouncedFilterState.extraFilter.is_active] }
                    )
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

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
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
                        const columnLocal = !column ? 'is_active'  : column
                        const columnIndex = columns.findIndex(c => c.name === columnLocal);
                        filterManager.changeExtraFilter({
                            [columnLocal]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => {
                                // dispatch(Creators.setReset(filterManager.getStateFromURL()))
                                filterManager.resetFilter();
                            }}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
