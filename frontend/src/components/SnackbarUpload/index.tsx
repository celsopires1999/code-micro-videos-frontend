import { Card, CardActions, Collapse, IconButton, List, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";

interface SnackbarUploadProps {
    
};

const SnackbarUpload: React.FC<SnackbarUploadProps> = (props) => {
    return (
        <Card>
            <CardActions>
                <Typography variant={"subtitle2"}>
                    Fazendo upload de 10 vídeo(s)
                </Typography>
                <div>
                    <IconButton
                        color={"inherit"}
                    >
                        <ExpandMoreIcon />
                    </IconButton>
                    <IconButton
                        color={"inherit"}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            </CardActions>
            <Collapse>
                <List>
                    Items
                </List>
            </Collapse>
        </Card>
    );
};

export default SnackbarUpload;
