import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
// import * as React from 'react';
import { useEffect, useState } from 'react';
// import { httpVideo } from '../../util/http';
// import { Chip } from '@material-ui/core';

import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
// import { id } from 'date-fns/locale';

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>;
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

interface Category {
    id: string,
    name: string
}

const Table = (props: Props) => {
    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        categoryHttp
            .list<{ data: Category[] }>()
            .then(({data}) => setData(data.data));
        // httpVideo.get('categories').then(
        //     response => setData(response.data.data)
        // )
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
