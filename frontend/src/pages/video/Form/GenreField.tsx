import { FormControl, FormControlProps, FormHelperText, Typography, useTheme } from "@material-ui/core";
import React, { MutableRefObject, RefAttributes, useCallback, useImperativeHandle, useRef } from "react";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import AsyncAutocomplete, { AsyncAutoCompleteComponent } from "../../../components/Table/AsyncAutocomplete";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../util/http/genre-http";
import { getGenresFromCategory } from "../../../util/model-filter";

interface GenreFieldProps extends RefAttributes<GenreFieldProps> {
    genres: any[]
    setGenres: (genres) => void
    categories: any[]
    setCategories: (categories) => void
    error: any
    disabled?: boolean
    FormControlProps?: FormControlProps
};
export interface GenreFieldComponent {
    clear: () => void
}
const GenreField = React.forwardRef<GenreFieldComponent, GenreFieldProps>((props, ref) => {
    const {
        genres,
        setGenres,
        categories,
        setCategories,
        error,
        disabled
    } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(genres, setGenres);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutoCompleteComponent>;
    const { removeItem: removeCategory } = useCollectionManager(categories, setCategories);
    const theme = useTheme();

    // async function fetchOptions(searchText) {
    //     return autocompleteHttp(
    //         genreHttp.
    //             list({
    //                 queryParams: {
    //                     search: searchText, all: ""
    //                 }
    //             })
    //     ).then((data) => data.data)
    //         .catch(error => console.error(error));
    // }

    const fetchOptions = useCallback((searchText) => {
        return autocompleteHttp(
            genreHttp
                .list({
                    queryParams: {
                        search: searchText, all: ""
                    }
                })
        ).then(data => data.data)
    }, [autocompleteHttp]);

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));
    return (
        <>
            <AsyncAutocomplete
                ref={autocompleteRef}
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
                    label: 'G??neros',
                    error: error !== undefined
                }}
            />
            <FormHelperText style={{ height: theme.spacing(3) }}>
                Escolha os g??neros do v??deo
            </FormHelperText>
            <FormControl
                margin={'normal'}
                fullWidth
                error={error !== undefined}
                disabled={disabled === true}
                {...props.FormControlProps}
            >
                <GridSelected>
                    {genres.map((genre, key) => (
                        <GridSelectedItem
                            key={key}
                            onDelete={() => {
                                const categoriesWithOneGenre = categories
                                    .filter(category => {
                                        const genresFromCategory = getGenresFromCategory(genres, category);
                                        return genresFromCategory.length === 1 && genresFromCategory[0].id === genre.id
                                    })
                                categoriesWithOneGenre.forEach(cat => removeCategory(cat));
                                removeItem(genre)
                            }}
                            xs={12}
                        >
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
});
export default GenreField;
