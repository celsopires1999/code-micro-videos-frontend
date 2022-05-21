import { Accordion, AccordionDetails, AccordionSummary, Card, CardContent, Divider, Grid, List, makeStyles, Theme, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Page } from "../../components/Page";
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

interface UploadsProps {

};
const Uploads: React.FC<UploadsProps> = (props) => {
    const classes = useStyles();
    return (
        <Page title={'Uploads'}>
            <Card elevation={5}>
                <CardContent>
                    <UploadItem>
                        Vídeo - E o vento levou
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
                                    <Divider />
                                    <UploadItem>
                                        Principal - nomedoarquivo.mp4
                                    </UploadItem>
                                </List>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
            </Card>
        </Page>
    );
};

export default Uploads;
