import { httpVideo } from "./index";
import HttpResource from "./http-resource";

const castMemberHttp = new HttpResource(httpVideo, 'cast_members');

export default castMemberHttp;