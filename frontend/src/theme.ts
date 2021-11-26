import { createTheme } from "@material-ui/core";

const theme = createTheme({
    palette: {
        primary: {
            main: '#79aec8',
            contrastText: '#fff'
        },
        secondary: {
            main: '#4db5ab',
            contrastText: '#fff'            
        },
        background: {
            default: '#fafafa'
        }
    },
});

export default theme;
