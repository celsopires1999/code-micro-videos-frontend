import { Typography } from "@material-ui/core";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import AsyncAutocomplete from "../../../components/Table/AsyncAutocomplete";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../util/http/genre-http";

interface GenreFieldProps {
    genres: any[]
    setGenres: (genres) => void
};
const GenreField: React.FC<GenreFieldProps> = (props) => {
    const { genres, setGenres } = props;
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
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    onChange: (event, value) => addItem(value)
                }}
                TextFieldProps={{
                    label: 'Gêneros'
                }}
            />
            <GridSelected>
                {genres.map((genre, key) => (
                    <GridSelectedItem key={key} onClick={() => console.log('clicou')} xs={12}>
                        <Typography noWrap={true}>
                            {genre.name}
                        </Typography>
                    </GridSelectedItem>
                ))}
            </GridSelected>
        </>
    );
};
export default GenreField;
