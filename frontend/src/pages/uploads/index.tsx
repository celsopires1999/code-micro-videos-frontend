import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, Divider, Grid, List, makeStyles, Theme, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Page } from "../../components/Page";
import { Creators } from "../../store/upload";
import { Upload, UploadModule } from "../../store/upload/types";
import { VideoFileFieldsMap } from "../../util/models";
import UploadItem from "./UploadItem";

const useStyles = makeStyles((theme: Theme) => ({
    panelSummary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
    },
    expandedIcon: {
        color: theme.palette.primary.contrastText
    }
}));

const Uploads = () => {
    const classes = useStyles();

    const uploads = useSelector<UploadModule, Upload[]>(
        (state) => state.upload.uploads
    );

    // Teste **** início ***
    const dispatch = useDispatch();

    useMemo(() => {
        setTimeout(() => {
            const obj: any = {
                video: {
                    id: '13f0df4b-9125-429f-888b-96799fae6840',
                    title: 'e o vento levou'
                },
                files: [
                    {
                        fileField: 'trailer_file', file: new File([''], 'teste.mp4',)
                    },
                    {
                        fileField: 'video_file', file: new File([''], 'teste.mp4',)
                    },
                ]
            }
            dispatch(Creators.addUpload(obj));
            const progress1 = {
                fileField: 'trailer_file',
                progress: 0.1,
                video: { id: '13f0df4b-9125-429f-888b-96799fae6840' }
            } as any;
            dispatch(Creators.updateProgress(progress1));
            const progress2 = {
                fileField: 'video_file',
                progress: 0.2,
                video: { id: '13f0df4b-9125-429f-888b-96799fae6840' }
            } as any;
            dispatch(Creators.updateProgress(progress2));
            // dispatch(Creators.addUpload(obj))
        }, 1000)
    }, [true]);
    // Teste *** fim ***

    return (
        <Page title={'Uploads'}>
            {
                uploads.map((upload, key) => (
                    <Card elevation={5} key={key}>
                        <CardContent>
                            <UploadItem uploadOrFile={upload}>
                                {upload.video.title}
                            </UploadItem>
                            <Accordion style={{ margin: 0 }}>
                                <AccordionSummary
                                    className={classes.panelSummary}
                                    expandIcon={<ExpandMoreIcon className={classes.expandedIcon} />}
                                >
                                    <Typography>Ver detalhes</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid item xs={12}>
                                        <List dense={true} style={{ padding: '0px' }}>
                                            {
                                                upload.files.map((file, key) => (
                                                    <React.Fragment key={key}>
                                                        <Divider />
                                                        <UploadItem uploadOrFile={file}>
                                                            {`${VideoFileFieldsMap[file.fileField]} - ${file.filename}`}
                                                        </UploadItem>
                                                    </React.Fragment>
                                                ))
                                            }
                                        </List>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                ))
            }
        </Page>
    );
};

export default Uploads;
