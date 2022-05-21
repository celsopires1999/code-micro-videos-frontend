import { CircularProgress, Fade, makeStyles, Theme } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) => ({
    progressContainer: {
        position: 'relative',
    },
    progressBackground: {
        color: grey['300'],
    },
    progress: {
        position: 'absolute',
        left: 0,
    },
}))

interface UploadProgressProps {
    size: number;
};
const UploadProgress: React.FC<UploadProgressProps> = (props) => {
    const { size } = props;
    const classes = useStyles();
    return (
        <Fade in={true} timeout={{ enter: 100, exit: 2000 }}>
            <div className={classes.progressContainer}>
                <CircularProgress
                    className={classes.progressBackground}
                    variant={'static'}
                    value={100}
                    size={size}
                />
                <CircularProgress
                    className={classes.progress}
                    variant={'static'}
                    value={50}
                    size={size}
                />
            </div>
        </Fade>
    );
};

export default UploadProgress;
