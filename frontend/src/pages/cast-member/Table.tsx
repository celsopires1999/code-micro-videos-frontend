import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DefaultTable, { makeActionStyles, TableColumn } from '../../components/Table';
import FilterResetButton from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import { Creators } from '../../store/filter';
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, CastMemberTypeMap, ListResponse } from '../../util/models';
import * as yup from '../../util/vendor/yup';


const castMemberNames = Object.values(CastMemberTypeMap);

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "43%"
    },
    {
        name: "type",
        label: "Tipo",
        width: "4%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
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
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    const {
        columns,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debouncedTime: debouncedTime,
        rowsPerPage,
        rowsPerPageOptions,
        extraFilter: {
            createValidationsSchema: () => {
                return yup.object().shape({
                    type: yup.string()
                        .nullable()
                        .transform(value => {
                            console.log('value: ', value)
                            return !value || !castMemberNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedFilterState) => {
                return debouncedFilterState.extraFilter
                    ? {
                        ...(
                            debouncedFilterState.extraFilter.type &&
                            { type: debouncedFilterState.extraFilter.type }
                        )
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    type: queryParams.get('type')
                }
            }
        },
    });

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
        debouncedFilterState.order.sort,
        debouncedFilterState.order.dir,
    ]);

    async function getData() {
        setLoading(true);
        try {
            const { data } = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (castMemberHttp.isCancelledRequest(error)) {
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
                options={{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => {
                                dispatch(Creators.setReset(filterManager.getStateFromURL()))
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
