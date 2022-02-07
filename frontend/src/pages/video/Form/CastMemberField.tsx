import { FormControl, FormControlProps, FormHelperText, Typography } from "@material-ui/core";
import React, { MutableRefObject, useImperativeHandle, useRef } from "react";
import { RefAttributes } from "react";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import AsyncAutocomplete, { AsyncAutoCompleteComponent } from "../../../components/Table/AsyncAutocomplete";
import useCollectionManager from "../../../hooks/useCollectionManager";
import useHttpHandled from "../../../hooks/useHttpHandled";
import castMemberHttp from "../../../util/http/cast-member-http";

interface CastMemberFieldProps extends RefAttributes<CastMemberFieldProps> {
    castMembers: any[]
    setCastMembers: (castMembers) => void
    error: any
    disabled?: boolean
    FormControlProps?: FormControlProps
};
export interface CastMemberFieldComponent {
    clear: () => void
}
const CastMemberField = React.forwardRef<CastMemberFieldComponent, CastMemberFieldProps>((props, ref) => {
    const {
        castMembers,
        setCastMembers,
        error,
        disabled
    } = props;
    const autocompleteHttp = useHttpHandled();
    const { addItem, removeItem } = useCollectionManager(castMembers, setCastMembers);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutoCompleteComponent>;
    async function fetchOptions(searchText) {
        return autocompleteHttp(
            castMemberHttp.
                list({
                    queryParams: {
                        search: searchText, all: "", sort: "name", dir: "asc"
                    }
                })
        ).then((data) => data.data)
            .catch(error => console.error(error));
    }
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
                    label: 'Membros de elencos',
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
                    {castMembers.map((castMember, key) => (
                        <GridSelectedItem
                            key={key}
                            onDelete={() => removeItem(castMember)}
                            xs={6}
                        >
                            <Typography noWrap={true}>
                                {castMember.name}
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
export default CastMemberField;
