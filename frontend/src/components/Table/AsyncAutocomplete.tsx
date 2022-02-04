import { Autocomplete, AutocompleteProps, UseAutocompleteSingleProps } from '@material-ui/lab'
import { CircularProgress, TextField, TextFieldProps } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';

interface AsyncAutocompleteProps {
    fetchOptions: (searchText: string) => Promise<any>;
    debouncedTime?: number
    TextFieldProps?: TextFieldProps;
    AutocompleteProps?: Omit<AutocompleteProps<any>, 'renderInput'> & UseAutocompleteSingleProps<any>;
};

const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
    const { AutocompleteProps, debouncedTime = 300 } = props;
    const { freeSolo = false, onOpen, onClose, onInputChange } = AutocompleteProps as any;
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebounce(searchText, debouncedTime);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const { enqueueSnackbar } = useSnackbar();
    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: { shrink: true },
        ...(props.TextFieldProps && { ...props.TextFieldProps })
    };

    const autocompleteProps: AutocompleteProps<any> = {
        loadingText: 'Carregando...',
        noOptionsText: 'Nenhum item encontrado',
        ...(AutocompleteProps && { ...AutocompleteProps }),
        open,
        options,
        loading,
        onOpen(event) {
            setOpen(true);
            onOpen && onOpen(event);
        },
        onClose(event) {
            setOpen(false);
            onClose && onClose(event);
        },
        onInputChange(event, value, reason) {
            setSearchText(value);
            onInputChange && onInputChange(event, value, reason);
        },
        renderInput: params => (
            <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={'inherit'} size={20} />}
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}
            />
        )
    }

    useEffect(() => {
        if (open || freeSolo) return;
        setOptions([]);

    }, [open]);

    useEffect(() => {
        if ((!open || debouncedSearchText === "") && freeSolo) return;

        let isSubscribed = true;
        (async function () {
            setLoading(true);
            try {
                const data = await props.fetchOptions(debouncedSearchText);
                if (isSubscribed) {
                    setOptions(data);
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, [enqueueSnackbar, freeSolo ? debouncedSearchText : open]);

    return (
        <Autocomplete {...autocompleteProps} />
    );
};

export default AsyncAutocomplete
