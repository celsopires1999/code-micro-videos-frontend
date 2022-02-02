import { Typography } from "@material-ui/core";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import AsyncAutocomplete from "../../../components/Table/AsyncAutocomplete";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandled from "../../../hooks/useHttpHandled";
import categoryHttp from "../../../util/http/category-http";
import { Genre } from "../../../util/models";

interface CategoryFieldProps {
    categories: any[]
    setCategories: (categories) => void
    genres: Genre[]
};
const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const { categories, setCategories, genres } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(categories, setCategories);
    async function fetchOptions(searchText) {
        return autocompleteHttp(
            categoryHttp.
                list({
                    queryParams: {
                        genres: genres.map(genre => genre.id).join(','),
                        all: ""
                    }
                })
        ).then((data) => data.data).catch(error => console.error(error));
    }
    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value),
                    disabled: !genres.length
                }}
                TextFieldProps={{
                    label: 'Categorias'
                }}
            />
            <GridSelected>
                {categories.map((category, key) => (
                    <GridSelectedItem key={key} onClick={() => console.log('clicou')} xs={12}>
                        <Typography noWrap={true}>
                            {category.name}
                        </Typography>
                    </GridSelectedItem>
                ))}
            </GridSelected>
        </>
    );
};
export default CategoryField;
