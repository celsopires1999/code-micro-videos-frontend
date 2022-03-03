import { Grid, ListItem, makeStyles, Theme, Typography } from "@material-ui/core";
import MovieIcon from "@material-ui/icons/Movie";
import ImageIcon from "@material-ui/icons/Image";
import UploadProgress from "../../components/UploadProgress";
import UploadAction from "./UploadAction";


const useStyles = makeStyles((theme: Theme) => ({
    gridTitle: {
        display: 'flex',
        color: '#999999'
    },
    icon: {
        color: theme.palette.error.main,
        minWidth: '40px'
    },
}));

interface UploadItemProps {

};

const UploadItem: React.FC<UploadItemProps> = (props) => {
    const classes = useStyles();

    function makeIcon() {
        if (true) { return <MovieIcon className={classes.icon} /> };
        return <ImageIcon className={classes.icon} />
    }

    return (
        <ListItem>
            <Grid
                className={classes.gridTitle}
                item
                xs={12}
                md={9}
            >
                {makeIcon()}
                <Typography color={'inherit'}>
                    {props.children}
                </Typography>
            </Grid>
            <Grid
                container
                direction={'row'}
                alignItems={'center'}
                justify={'flex-end'}
            >
                <UploadProgress size={48} />
                <UploadAction />
            </Grid>
        </ListItem>
    );
};

export default UploadItem;
