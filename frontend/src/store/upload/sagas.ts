import { Types } from ".";
import { actionChannel, take, call } from "redux-saga/effects";
import { AddUploadAction, FileInfo } from "./types";
import { Video } from "../../util/models";
import videoHttp from "../../util/http/video-http";

export function* uploadWatcherSaga() {
    const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);

    while (true) {
        const { payload }: AddUploadAction = yield take(newFilesChannel);
        for (const fileInfo of payload.files) {
            yield call(uploadFile, { video: payload.video, fileInfo });
        }
        console.log('payload==>>', payload)
    }
}

function* uploadFile({ video, fileInfo }: { video: Video, fileInfo: FileInfo }) {
    yield call(sendUpload, { id: video.id, fileInfo });
    console.log('uploadFile==>>: ', video, fileInfo);
}

function* sendUpload({ id, fileInfo }: { id: string, fileInfo: FileInfo }) {
    videoHttp.partialUpdate(id, {
        _method: 'PATCH',
        [fileInfo.fileField]: fileInfo.file
    }, {
        http: {
            usePost: true
        },
        config: {
            onUploadProgress(progressEvent) {
                console.log('progressEvent==>> ', progressEvent)
            }
        }
    })
}