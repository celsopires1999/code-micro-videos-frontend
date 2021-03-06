import { MenuItem, TextField } from "@material-ui/core";
import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router";
import * as yup from 'yup';
import categoryHttp from "../../util/http/category-http";
import genreHttp from "../../util/http/genre-http";
import { useSnackbar } from "notistack";
import { Category, Genre } from "../../util/models";
import DefaultForm from "../../components/DefaultForm";
import LoadingContext from "../../components/loading/LoadingContext";
import SubmitActions from "../../components/SubmitActions";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
    categories_id: yup.array()
        .label('Categorias')
        .required()
        .min(1),
});

export const Form = () => {
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        errors,
        reset,
        triggerValidation,
        formState
    } = useForm<{ name, categories_id }>({
        validationSchema,
        defaultValues: {
            categories_id: []
        }
    });
    useSnackbarFormError(formState.submitCount, errors);
    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();
    const [categories, setCategories] = useState<Category[]>([]);
    const { id }: any = useParams();
    const [genre, setGenre] = useState<Genre | null>(null);
    const loading = React.useContext(LoadingContext);

    // get data to enable Genre edit
    useEffect(() => {
        let isSubscribed = true;

        (async () => {
            const promises = [categoryHttp.list({ queryParams: { all: '' } })];
            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);
                if (isSubscribed) {
                    setCategories(categoriesResponse.data.data);
                }
                if (id && isSubscribed) {
                    setGenre(genreResponse.data.data);
                    // setGenre(genreResponse.data.data)
                    const categories_id = genreResponse.data.data.categories.map(category => category.id);
                    reset({
                        ...genreResponse.data.data,
                        categories_id
                    });
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    `N??o foi poss??vel carregar as informa????es`,
                    { variant: 'error' }
                )
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, [id, reset, enqueueSnackbar]);

    // registrado componente categories_id
    useEffect(() => {
        register({ name: "categories_id" })
    }, [register]);

    function onSubmit(formData, event) {
        const http = !genre
            ? genreHttp
                .create(formData)
            : genreHttp
                .update(id, formData)
        http
            .then(
                ({ data }) => {
                    enqueueSnackbar(
                        `G??nero salvo com sucesso`,
                        { variant: 'success' });
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
                        `N??o foi poss??vel gravar o g??nero`,
                        { variant: 'error' });
                }
            )
        // .finally(() => setLoading(false))
    }

    return (
        <DefaultForm GridItemProps={{ xs: 12, md: 6 }} onSubmit={handleSubmit(onSubmit)} >
            <TextField
                name="name"
                label="Nome"
                fullWidth
                variant="outlined"
                inputRef={register}
                error={errors.name !== undefined}
                disabled={loading}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{ shrink: true }}
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
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
                InputLabelProps={{ shrink: true }}
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
            <SubmitActions
                disabledButtons={loading}
                handleSave={() =>
                    triggerValidation().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </DefaultForm>
    );
};
