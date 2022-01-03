import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useEffect, useState } from 'react';
import DefaultTable, { TableColumn } from '../../components/Table';
import castMemberHttp from '../../util/http/cast-member-http';
import { CastMember, ListResponse } from '../../util/models';


const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator'
}

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
        width: "13%"
    },
];

type Props = {

};
const Table = (props: Props) => {
    const [data, setData] = useState<CastMember[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        let isSubscribed = true;

        (async () => {
            setLoading(true);
            try {
                const { data } = await castMemberHttp.list<ListResponse<CastMember>>();
                if (isSubscribed) {
                    setData(data.data)
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
