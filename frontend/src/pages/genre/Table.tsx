import * as React from 'react';
import { useEffect, useState } from 'react';
import genreHttp from '../../util/http/genre-http';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Genre, ListResponse } from '../../util/models';
import DefaultTable, { TableColumn } from '../../components/Table';
import { useSnackbar } from 'notistack';

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
        width: "10%"
    },
    {
        name: "categories",
        label: "Categorias",
        width: "33%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value.map(value => value.name).join(', ');
            }
        }
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
        }
    },
    {
        name: "actions",
        label: "Ações",
        width: "13%"
    },
];

type Props = {

};
const Table = (props: Props) => {
    const [data, setData] = useState<Genre[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        let isSubscribed = true;

        (async () => {
            setLoading(true);
            try {
                const { data } = await genreHttp.list<ListResponse<Genre>>();
                if (isSubscribed) {
                    setData(data.data);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    `Não foi possível encontrar as informações`,
                    { variant: 'error' }
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, [enqueueSnackbar]);

    return (
        <div>
            <DefaultTable
                title=""
                columns={columnsDefinition}
                data={data}
                loading={loading}
            />
        </div>
    );
};

export default Table;
