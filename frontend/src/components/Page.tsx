import { Box, Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import * as React from 'react';

const useStyles = makeStyles({
    title: {
        color: '#999999'
    }
});

type PageProps = {
    title: string
};
export const Page:React.FC<PageProps> = (props) => {
    const classes = useStyles();
    return (
        <Container>
            <Box paddingTop={1}>
                <Typography className={ classes.title } component="h1" variant="h5" >
                    { props.title }
                </Typography>
                { props.children }
            </Box>
        </Container>
    );
};