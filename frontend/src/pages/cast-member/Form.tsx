import * as React from "react";
import { FormHelperText, TextField } from "@material-ui/core";
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import castMemberHttp from "../../util/http/cast-member-http";
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import { useParams, useHistory } from "react-router";
import { CastMember } from "../../util/models";
import DefaultForm from "../../components/DefaultForm";
import LoadingContext from "../../components/loading/LoadingContext";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";
import SubmitActions from "../../components/SubmitActions";

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
    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        triggerValidation,
        formState
    } = useForm<{ name, type }>({
        validationSchema,
    });
    useSnackbarFormError(formState.submitCount, errors);
    const { enqueueSnackbar } = useSnackbar();
    const { id }: any = useParams();
    const [castMember, setCastMember] = useState<CastMember | null>(null);
    const loading = React.useContext(LoadingContext);
    // const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        register({ name: "type" })
    }, [register]);

    useEffect(() => {
        let isSubscribed = true;
        if (!id) {
            return
        }
        (async () => {
            try {
                const { data } = await castMemberHttp.get(id);
                if (isSubscribed) {
                    setCastMember(data.data);
                    reset(data.data)
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    `Erro ao obter membro de elenco para edição: ${id}`,
                    { variant: 'error' }
                );
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, [id, reset, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        try {
            const http = !castMember
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(id, formData)
            const { data } = await http;
            enqueueSnackbar(
                `Membro de elenco salvo com sucesso`,
                { variant: 'success' });
            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace(`/cast-members/${data.data.id}/edit`)
                            : history.push(`/cast-members/${data.data.id}/edit`)
                    )
                    : history.push(`/cast-members`)
            });
        } catch (error) {
            console.error(error);
            enqueueSnackbar(
                `Não foi possível gravar o membro de elenco`,
                { variant: 'error' }
            );
        }
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
                helperText={errors.name && errors.name.message}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
            />
            <FormControl
                margin="normal"
                error={errors.type !== undefined}
                disabled={loading}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value));
                    }}
                    value={watch('type') + ""}
                >
                    <FormControlLabel value="1" control={<Radio />} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio />} label="Ator" />
                </RadioGroup>
                {
                    errors.type && <FormHelperText >{errors.type.message}</FormHelperText>
                }
            </FormControl>
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
