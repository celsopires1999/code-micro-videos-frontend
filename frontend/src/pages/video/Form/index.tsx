import { Card, CardContent, Checkbox, FormControlLabel, FormHelperText, Grid, TextField, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useHistory } from "react-router";
import * as yup from '../../../util/vendor/yup';
import { Video, VideoFileFieldsMap } from "../../../util/models";
import SubmitActions from "../../../components/SubmitActions";
import DefaultForm from "../../../components/DefaultForm";
import videoHttp from "../../../util/http/video-http";
import RatingField from "./RatingField";
import UploadField from "./UploadField";
import { makeStyles } from "@material-ui/styles";
import GenreField from "./GenreField";
import CategoryField from "./CategoryField";

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        margin: theme.spacing(2, 0)
    }
}));

const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Título')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lançamento')
        .required()
        .min(1),
    duration: yup.number()
        .label('Duração')
        .required()
        .min(1),
    rating: yup.string()
        .label('Classificação')
        .required(),
});

const fileFields = Object.keys(VideoFileFieldsMap);

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
    } = useForm<{
        title,
        description,
        year_launched,
        duration,
        rating,
        cast_members,
        genres,
        categories,
        opened
    }>({
        validationSchema,
        defaultValues: {
            genres: [],
            categories: []
        }
    });

    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();
    const { id }: any = useParams();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));

    const classes = useStyles();

    useEffect(() => {
        [
            'rating',
            'opened',
            'genres',
            'categories',
            ...fileFields
        ].forEach(name => register({ name }));
    }, [register]);

    useEffect(() => {
        if (!id) {
            return
        }
        let isSubscribed = true;

        (async () => {
            setLoading(true);
            try {
                const { data } = await videoHttp.get(id);
                if (isSubscribed) {
                    setVideo(data.data);
                    reset(data.data);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    `Não foi possível encontrar o vídeo: ${id}`,
                    { variant: 'error' }
                );
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isSubscribed = false;
        }

    }, [id, reset, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create(formData)
                : videoHttp.update(video.id, formData)
            const { data } = await http;
            enqueueSnackbar(
                'Vídeo salvo com sucesso',
                { variant: 'success' }
            )
            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace(`/videos/${data.data.id}/edit`)
                            : history.push(`/videos/${data.data.id}/edit`)
                    )
                    : history.push('/videos')
            })
        } catch (error) {
            console.error(error);
            enqueueSnackbar(
                'Não foi possível gravar o vídeo',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <DefaultForm
            GridItemProps={{ xs: 12 }}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name="title"
                        label="Título"
                        variant="outlined"
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                    />
                    <TextField
                        name="description"
                        label="Sinopse"
                        multiline
                        rows="4"
                        margin="normal"
                        variant="outlined"
                        fullWidth
                        inputRef={register}
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                name="year_launched"
                                label="Ano de lançamento"
                                type="number"
                                margin="normal"
                                variant="outlined"
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{ shrink: true }}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="duration"
                                label="Duração"
                                type="number"
                                margin="normal"
                                variant="outlined"
                                fullWidth
                                inputRef={register}
                                disabled={loading}
                                InputLabelProps={{ shrink: true }}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br />
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                genres={watch('genres') as any}
                                setGenres={(value) => setValue('genres', value, true)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                categories={watch('categories') as any}
                                setCategories={(value) => setValue('categories', value, true)}
                                genres={watch('genres') as any}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormHelperText>
                                Escolha os gêneros do vídeo
                            </FormHelperText>
                            <FormHelperText>
                                Escolha pelo menos uma categoria de cada gênero
                            </FormHelperText>
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating') as any}
                        setValue={(value) => setValue('rating', value, true)}
                        error={errors.rating}
                        disabled={loading}
                        FormControlProps={{
                            margin: isGreaterMd ? 'none' : 'normal'
                        }}
                    />
                    <br />
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Imagens
                            </Typography>
                            <UploadField
                                accept={'image/*'}
                                label={'Thumb'}
                                setValue={(value) => setValue('thumb_file', value)}
                            />
                            <UploadField
                                accept={'image/*'}
                                label={'Banner'}
                                setValue={(value) => setValue('banner_file', value)}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color="primary" variant="h6">
                                Vídeos
                            </Typography>
                            <UploadField
                                accept={'video/mp4'}
                                label={'Trailer'}
                                setValue={(value) => setValue('trailer_file', value)}
                            />
                            <UploadField
                                accept={'video/mp4'}
                                label={'Principal'}
                                setValue={(value) => {
                                    setValue('video_file', value)
                                }}
                            />
                        </CardContent>
                    </Card>
                    <br />
                    <FormControlLabel
                        disabled={loading}
                        control={
                            <Checkbox
                                name="opened"
                                color={"primary"}
                                onChange={
                                    () => setValue('opened', !getValues()['opened'])
                                }
                                checked={(watch('opened')) as boolean}
                            />
                        }
                        label={
                            <Typography color={"primary"} variant={"subtitle2"}>
                                Quero que esse conteúdo apareça na seção lançamentos
                            </Typography>
                        }
                        labelPlacement='end'
                    />
                </Grid>
            </Grid>
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
