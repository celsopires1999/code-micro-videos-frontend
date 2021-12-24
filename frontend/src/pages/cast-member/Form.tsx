import * as React from "react";
import { Box, Button, ButtonProps, makeStyles, TextField, Theme } from "@material-ui/core";
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@material-ui/core";
import { useEffect, useState } from "react";
import useForm from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import { useSnackbar} from 'notistack';
import * as yup from 'yup';
import { useParams, useHistory } from "react-router";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string()
            .label('Nome')
            .required()
            .max(255),
    type: yup.number()
            .label('Tipo')
            .required(),
});

export const Form = () => {

    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState<boolean>(false);
    const {id}:any = useParams();
    const [castMember, setCastMember] = useState();
    const classes = useStyles();
    const history = useHistory();

    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: "contained",
        disabled: loading,
    }

    const { 
        register, 
        handleSubmit, 
        getValues, 
        setValue, 
        errors, 
        reset,
        watch
    } = useForm<{name, type}>({
        validationSchema,
    });
    
    useEffect(() => {
        register({name: "type"})
    }, [register]);

    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true);
        castMemberHttp.get(id)
            .then(({data})=>{
                setCastMember(data.data);
                reset(data.data);
            })
            .catch((error)=>{
                enqueueSnackbar(`Erro ao obter membro de elenco para edição: ${id}`, {variant: 'error'});
                console.log(error);
            })
            .finally(()=> setLoading(false));
        }, [id, reset, enqueueSnackbar]
    );

    function onSubmit(formData, event) {
        setLoading(true);
        const http = !castMember 
                ? castMemberHttp.create(formData) 
                : castMemberHttp.update(id, formData)
        http
            .then(({data}) => {
                enqueueSnackbar(
                    `Membro de elenco salvo com sucesso`,
                    {variant: 'success'});
                setTimeout(()=>{
                    event 
                    ? (
                        id 
                            ? history.replace(`/cast-members/${data.data.id}/edit`)
                            : history.push(`/cast-members/${data.data.id}/edit`)
                    )
                    : history.push(`/cast-members`)
                });
            })
            .catch(error => {
                console.log(error);
                enqueueSnackbar(
                    `Não foi possível gravar o membro de elenco`,
                    {variant: 'error'}
                );
            })
            .finally(()=>setLoading(false));
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
                helperText={ errors.name && errors.name.message }
                InputLabelProps={{shrink: true}}
                disabled= { loading }
            />
            <FormControl margin="normal">
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue('type',parseInt(e.target.value));
                    }}
                    value={ watch('type') + ""}
                    >
                    <FormControlLabel value="1" control={<Radio />} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio />} label="Ator" />
                </RadioGroup>
            </FormControl>
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
