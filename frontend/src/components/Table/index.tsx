import * as React from 'react';
import MUIDataTable, { MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps } from 'mui-datatables';
import { merge, omit, cloneDeep } from 'lodash';
import { useTheme } from '@material-ui/styles';
import { MuiThemeProvider, Theme, useMediaQuery } from '@material-ui/core';

export interface TableColumn extends MUIDataTableColumn {
    width?: string;
}

const defaultOptions: MUIDataTableOptions = {
    print: false,
    download: false,
    textLabels: {
        body: {
            noMatch: "Nenhum registro encontrado",
            toolTip: "Classificar",
        },
        pagination: {
            next: "Próxima página",
            previous: "Página anterior",
            rowsPerPage: "Por página:",
            displayRows: "de",
        },
        toolbar: {
            search: "Busca",
            downloadCsv: "Download CSV",
            print: "Imprimir",
            viewColumns: "Ver Colunas",
            filterTable: "Filtrar Tabelas",
        },
        filter: {
            all: "Todos",
            title: "FILTROS",
            reset: "LIMPAR",
        },
        viewColumns: {
            title: "Ver Colunas",
            titleAria: "Ver/Esconder Colunas da Tabela",
        },
        selectedRows: {
            text: "registros(s) selecionados",
            delete: "Excluir",
            deleteAria: "Excluir registros selecionados",
        },
    },
}

interface TableProps extends MUIDataTableProps {
    columns: TableColumn[];
    loading?: boolean;
}

const Table: React.FC<TableProps> = (props) => {

    function extractMUIDataTableColumns(columns: TableColumn[]): MUIDataTableColumn[] {
        setColumnsWidth(columns);
        return columns.map(column => omit(column, 'width'));
    }

    function setColumnsWidth(colums: TableColumn[]) {
        colums.forEach((column, key) => {
            if (column.width) {
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeader[`&:nth-child(${key + 2})`] = {
                    width: column.width,
                }
            }
        })
    }

    function applyLoading() {
        const textLabels = (newProps.options as any).textLabels;
        // textLabels.body.noMatch = newProps.loading === true
        //     ? 'Carregando...'
        //     : textLabels.body.noMatch;
        if (newProps.loading) {
            textLabels.body.noMatch = 'Carregando...'
        }
    }

    function applyResponsive() { 
        newProps.options.responsive = isSmOrDown ? 'simple' : 'standard'
    }

    function getOriginalMuiDataTableProps() {
        return omit(newProps, 'loading');
    }

    const theme = cloneDeep<Theme>(useTheme());
    const isSmOrDown = useMediaQuery(theme.breakpoints.down('sm'));

    const newProps = merge(
        { options: cloneDeep(defaultOptions) },
        omit(props, 'columns'),
        // props,
        { columns: extractMUIDataTableColumns(props.columns) },
    );

    applyLoading();
    applyResponsive();

    const originalProps = getOriginalMuiDataTableProps();

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable
                {...originalProps}
            />
        </MuiThemeProvider>
    );
};

export default Table;