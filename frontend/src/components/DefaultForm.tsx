import * as React from 'react';
import { Grid, GridProps, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    gridItem: {
        padding: theme.spacing(1, 0)
    },
}));

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    GridContainerProps?: GridProps;
    GridItemProps?: GridProps;
}

const DefaultForm: React.FC<DefaultFormProps> = (props) => {

    const classes = useStyles();
    const { GridContainerProps, GridItemProps, ...others } = props;

    return (
        <form { ...others }>
            <Grid container { ...GridContainerProps }>
                <Grid className={ classes.gridItem } item { ...GridItemProps } >
                    { props.children }
                </Grid>
            </Grid>
        </form>
    );
};

export default DefaultForm;
