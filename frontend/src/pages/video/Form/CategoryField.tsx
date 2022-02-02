import { FormControl, FormControlProps, FormHelperText, Typography } from "@material-ui/core";
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
    error: any
    disabled?: boolean
    FormControlProps?: FormControlProps
};
const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const { categories, setCategories, genres, error, disabled } = props;
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
                    // autoSelect: true,
                    clearOnEscape: true,
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled === true || !genres.length
                }}
                TextFieldProps={{
                    label: 'Categorias',
                    error: error !== undefined
                }}
            />
            <FormControl
                margin={'normal'}
                fullWidth
                error={error !== undefined}
                disabled={disabled === true}
                {...props.FormControlProps}
            >
                <GridSelected>
                    {categories.map((category, key) => (
                        <GridSelectedItem key={key} onClick={() => console.log('clicou')} xs={12}>
                            <Typography noWrap={true}>
                                {category.name}
                            </Typography>
                        </GridSelectedItem>
                    ))}
                </GridSelected>
                {
                    error && <FormHelperText >{error.message}</FormHelperText>
                }
            </FormControl>
        </>
    );
};
export default CategoryField;
