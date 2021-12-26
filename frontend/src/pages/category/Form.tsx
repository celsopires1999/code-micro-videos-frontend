import * as React from "react";
import { Checkbox, FormControlLabel, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import useForm from "react-hook-form";
import { useParams, useHistory } from "react-router";
import categoryHttp from "../../util/http/category-http";
import * as yup from '../../util/vendor/yup';
import { Category } from "../../util/models";
import SubmitActions from "../../components/SubmitActions";

const validationSchema = yup.object().shape({
    name: yup.string()
        .label('Nome')
        .required()
        .max(255),
});

export const Form = () => {
    const { 
        register, 
        handleSubmit, 
        getValues, 
        setValue,
        errors, 
        reset, 
        watch,
        triggerValidation
    } = useForm({
        validationSchema,
        defaultValues: {
            is_active: true
        }
    });

    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();
    const {id}:any = useParams();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        register({name: 'is_active'})
    }, [register]);

    useEffect(() => {
        if (!id){
            return
        }
        setLoading(true);
        (async function () {
            try {
                const {data} = await categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    `Não foi possível encontrar a categoria: ${id}`,
                    {variant: 'error'}
                );              
            } finally {
                setLoading(false);
            }
        })();
    }, [id, reset, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !category 
                ? categoryHttp.create(formData) 
                : categoryHttp.update(id, formData)
            const {data} = await http;
            enqueueSnackbar(
                'Categoria salva com sucesso',
                {variant: 'success'}
            )
            setTimeout(()=>{
                event
                ? (
                    id
                        ? history.replace(`/categories/${data.data.id}/edit`)
                        : history.push(`/categories/${data.data.id}/edit`)
                )
                : history.push('/categories')
            })            
        } catch (error) {
            console.error(error);
            enqueueSnackbar(
                'Não foi possível gravar a categoria',
                {variant: 'error'}
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={ handleSubmit(onSubmit) }>
            <TextField 
                name="name"
                label="Nome"
                fullWidth
                variant="outlined"
                inputRef={ register }
                error={ errors.name !== undefined }
                disabled={loading}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />
            <TextField 
                name="description"
                label="Descrição"
                multiline
                rows="4"
                fullWidth
                variant="outlined"
                margin="normal"
                inputRef={ register }
                disabled={loading}
                InputLabelProps={{shrink: true}}
            />
            <FormControlLabel 
                disabled={loading}
                control={
                    <Checkbox 
                        name="is_active"
                        color={ "primary" }
                        onChange={
                            () => setValue('is_active', !getValues()['is_active'])
                        }
                        checked={ (watch('is_active')) as boolean }
                    />   
                }
                label={'Ativo?'}
                labelPlacement='end'
            />
            <SubmitActions 
                disabledButtons={ loading } 
                handleSave={ () =>
                    triggerValidation().then(isValid => {
                        isValid && onSubmit(getValues(), null)
                    })
                }
            />
        </form>
    );
};
