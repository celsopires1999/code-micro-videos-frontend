import { MUIDataTableColumn } from "mui-datatables";
import { Dispatch, Reducer, useReducer, useState } from "react";
import reducer, { Creators, INITIAL_STATE } from "../store/filter";
import { Actions as FilterActions, State as FilterState } from '../store/filter/types'
import { useDebounce } from 'use-debounce';
import { useHistory } from 'react-router';
import { History } from 'history';

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debouncedTime: number;
    history: History;
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> { }

export default function useFilter(options: UseFilterOptions) {

    const history = useHistory();
    const filterManager = new FilterManager({ ...options, history });
    //TODO: pegar o state da url
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const [debouncedFilterState] = useDebounce(filterState, options.debouncedTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    filterManager.state = filterState;
    filterManager.dispatch = dispatch;

    filterManager.applyOrderInColumns();

    return {
        columns: filterManager.columns,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    history: History;

    constructor(options: FilterManagerOptions) {
        const { columns, rowsPerPage, rowsPerPageOptions, history } = options;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.history = history;
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({ search: value }));
    }

    changePage(page) {
        this.dispatch(Creators.setPage({ page: page + 1 }));
    }

    changeRowsPerPage(perPage) {
        this.dispatch(Creators.setPerPage({ per_page: perPage }))
    }

    changeColumnSort(changedColumn: string, direction: string) {
        this.dispatch(Creators.setOrder({
            sort: changedColumn,
            dir: direction.includes('desc') ? 'desc' : 'asc',
        }))
    }

    applyOrderInColumns() {
        this.columns = this.columns.map(column => {
            return column.name === this.state.order.sort
                ? {
                    ...column,
                    options: {
                        ...column.options,
                        sortDirection: this.state.order.dir as any
                        // sortOrder: this.state.order.dir as any
                    }
                }
                : column;
        });
    }

    cleanSearchText(text) {
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText;
    }

    pushHistory() {
        const newLocation = {
            pathname: 'endereço',
            search: '?search=teste&page=1&sort=name&dir=asc',
            state: {

            }
        }
        this.history.push(newLocation);
    }
}
