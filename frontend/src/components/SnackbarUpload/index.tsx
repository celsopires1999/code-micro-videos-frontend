import { Card, CardActions, Collapse, IconButton, List, Typography } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import { useSnackbar } from "notistack";

interface SnackbarUploadProps {
    id: string | number;
};

const SnackbarUpload = React.forwardRef<any, SnackbarUploadProps>((props, ref) => {
    const { id } = props;
    const { closeSnackbar } = useSnackbar();
    return (
        <Card ref={ref}>
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
                        onClick={() => closeSnackbar(id)}
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
});

export default SnackbarUpload;
