import { Box, Button, ButtonProps, makeStyles, MenuItem, TextField, Theme } from "@material-ui/core";
import * as React from "react";
import { useEffect, useState } from "react";
import useForm from "react-hook-form";
import { useHistory, useParams } from "react-router";
import * as yup from 'yup';
import categoryHttp from "../../util/http/category-http";
import genreHttp from "../../util/http/genre-http";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

const validationSchema = yup.object().shape({
    name: yup.string()
            .label('Nome')
            .required()
            .max(255),
})

export const Form = () => {

    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();
    const classes = useStyles();
    const [categories, setCategories] = useState<any[]>([]);
    const {id}:any = useParams();
    const [genre, setGenre] = useState();
    const [loading, setLoading] = useState<boolean>(false);
    
    const { register, handleSubmit, getValues, setValue, watch, errors, reset } = useForm<{categories_id}>({
        validationSchema,
        defaultValues: {
            categories_id: []
        }
    });

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: "contained",
        disabled: loading,
    }

   // get Genre to be updated
    useEffect(() => {
            if (!id) {
                return
            }
            setLoading(true);
            genreHttp.get(id)
                .then(
                    ({data}) => {
                        setGenre(data.data);
                        reset(data.data);
                    }
                )
                .catch(
                    (error) => {
                        enqueueSnackbar(`Erro ao obter Genre para edição: ${id}`, {variant:'error'})
                        console.log('get Genre to be updated: ', error)
                    }
                )
                .finally(() => setLoading(false))
        }, [id, reset, enqueueSnackbar]
    );

    // registrado componente categories_id
    useEffect( () => {
        register({name: "categories_id"})
    }, [register]);

    // hydrate select of categories
    useEffect( () => {
        setLoading(true);
        categoryHttp
            .list()
            .then(({data}) => setCategories(data.data))
            .catch((error)=> {
                enqueueSnackbar(`Erro ao obter categorias para seleção`, {variant: 'error'});
                console.log(error);
            })
            .finally(() => setLoading(false))
    }, [enqueueSnackbar]); 
    
    function onSubmit(formData, event) {
        setLoading(true)
        const http = !genre
            ? genreHttp
                .create(formData)
             : genreHttp
                .update(id, formData)
        http
            .then(
                ({data}) => {
                    enqueueSnackbar(
                        `Gênero salvo com sucesso`, 
                        {variant: 'success'});
                    setTimeout(
                        () => {
                            event 
                            ? (
                                id
                                    ? history.replace(`/genres/${data.data.id}/edit`)
                                    : history.push(`/genres/${data.data.id}/edit`)
                            )
                            : history.push(`/genres`)
                        }
                    )
                }
            )
            .catch(
                (error) => {
                    console.log('onSubmit: ', error);
                    enqueueSnackbar(
                        `Não foi possível gravar o gênero`,
                        {variant: 'error'});
                }
            )
            .finally(() => setLoading(false))
    }

    return (
        <form onSubmit={ handleSubmit(onSubmit) }>
            <TextField 
                name="name"
                label="Nome"
                fullWidth
                variant="outlined"
                inputRef={ register }
                error={ errors.name !== undefined}
                disabled={loading}
                helperText={ errors.name && errors.name.message }
                InputLabelProps={ {shrink: true} }
            />
            <TextField
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={"normal"}
                variant={"outlined"}
                fullWidth
                disabled={loading}
                onChange={(e) => {
                    setValue('categories_id', e.target.value);
                }}
                SelectProps={{
                    multiple: true
                }}
                
            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>
            <Box dir="rtl">
                <Button 
                    color={"primary"}
                    { ...buttonProps} 
                    onClick={ () => onSubmit(getValues(), null) }
                >
                    Salvar
                </Button>
                <Button { ...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
