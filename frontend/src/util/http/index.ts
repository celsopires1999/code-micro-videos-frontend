import axios from "axios";

export const httpVideo = axios.create({
    baseURL: process.env.REACT_APP_VIDEO_API_URL
});
