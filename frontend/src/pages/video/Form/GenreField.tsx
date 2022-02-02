import { FormControl, FormControlProps, FormHelperText, Typography } from "@material-ui/core";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import AsyncAutocomplete from "../../../components/Table/AsyncAutocomplete";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../util/http/genre-http";

interface GenreFieldProps {
    genres: any[]
    setGenres: (genres) => void
    error: any
    disabled?: boolean
    FormControlProps?: FormControlProps
};
const GenreField: React.FC<GenreFieldProps> = (props) => {
    const { genres, setGenres, error, disabled } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(genres, setGenres);
    async function fetchOptions(searchText) {
        return autocompleteHttp(
            genreHttp.
                list({
                    queryParams: {
                        search: searchText, all: ""
                    }
                })
        ).then((data) => data.data)
            .catch(error => console.error(error));
    }
    // const fetchOptions = (searchText) => autocompleteHttp(
    //     genreHttp.
    //         list({
    //             queryParams: {
    //                 search: searchText, all: ""
    //             }
    //         })
    // ).then((data) => data.data).catch(error => console.error(error));
    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    // autoSelect: true,
                    clearOnEscape: true,
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled
                }}
                TextFieldProps={{
                    label: 'Gêneros',
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
                    {genres.map((genre, key) => (
                        <GridSelectedItem key={key} onClick={() => console.log('clicou')} xs={12}>
                            <Typography noWrap={true}>
                                {genre.name}
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
export default GenreField;
