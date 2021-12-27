import * as React from 'react';
import MUIDataTable, { MUIDataTableColumn } from 'mui-datatables';
import { useEffect, useState } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import categoryHttp from '../../util/http/category-http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';

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

const Table = (props: Props) => {
    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        let isSubscribed = true;

        (async function () {
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>();
                if (isSubscribed) {
                    setData(data.data);
                }
            } catch (error) {
                console.error(error);
            }
        })();

        return () => {
            isSubscribed = false;
        }

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
