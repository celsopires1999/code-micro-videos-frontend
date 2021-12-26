import * as React from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { useEffect, useState } from 'react';
import castMemberHttp from '../../util/http/cast-member-http';

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { CastMember, ListResponse } from '../../util/models';

const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator'
}

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo", 
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{ format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    }
];

type Props = {
    
};
const Table = (props: Props) => {
    const [data, setData] = useState<CastMember[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
                setData(data.data)                
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return (
        <div>
            <MUIDataTable 
                title=""
                columns={ columnsDefinition }
                data={ data }
                />
        </div>
    );
};

export default Table;
