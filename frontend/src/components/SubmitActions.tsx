import { Box, Button, ButtonProps, makeStyles, Theme } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

interface SubmitActionsOptions {
    disabledButtons?: boolean;
    handleSave: () => void;
}

const SubmitActions: React.FC<SubmitActionsOptions> = (props) => {
    const classes = useStyles();
    const buttonProps: ButtonProps = {
        className: classes.submit,
        color: "secondary",
        variant: "contained",
        disabled: props.disabledButtons === undefined ? false : props.disabledButtons,
    }

    return (
        <Box dir="ltf">
            <Button color={"primary"} {...buttonProps} type="submit" onClick={props.handleSave}>
                Salvar
            </Button>
            <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
        </Box>
    );
};

export default SubmitActions;
