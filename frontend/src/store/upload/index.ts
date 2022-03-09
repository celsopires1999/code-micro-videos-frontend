import * as Typings from "./types";
import { createActions, createReducer } from "reduxsauce";
import update from "immutability-helper";

export const { Types, Creators } = createActions<{
    ADD_UPLOAD: string,
    REMOVE_UPLOAD: string,
    UPDATE_PROGRESS: string,

}, {
    addUpload(payload: Typings.AddUploadAction['payload']): Typings.AddUploadAction
    removeUpload(payload: Typings.RemoveUploadAction['payload']): Typings.RemoveUploadAction
    updateProgress(payload: Typings.UpdateProgressAction['payload']): Typings.UpdateProgressAction

}>
    ({
        addUpload: ['payload'],
        removeUpload: ['payload'],
        updateProgress: ['payload'],
    });

export const INITIAL_STATE: Typings.State = {
    uploads: [],
};

const reducer = createReducer(INITIAL_STATE, {
    [Types.ADD_UPLOAD]: addUpload,
    [Types.REMOVE_UPLOAD]: removeUpload,
    [Types.UPDATE_PROGRESS]: updateProgress,
});

export default reducer;

function addUpload(state = INITIAL_STATE, action: Typings.AddUploadAction): Typings.State {
    if (!action.payload.files.length) { return state };

    const index = findIndexUpload(state, action.payload.video.id);
    if (index !== -1 && state.uploads[index].progress < 1) { return state };

    const uploads = index === -1
        ? state.uploads
        : update(state.uploads, {
            $splice: [[index, 1]]
        });

    return {
        uploads: [
            ...uploads,
            {
                video: action.payload.video,
                progress: 0,
                files: action.payload.files.map(file => ({
                    fileField: file.fileField,
                    filename: file.file.name,
                    progress: 0
                }))
            }
        ]
    }
}

function removeUpload(state = INITIAL_STATE, action: Typings.RemoveUploadAction): Typings.State {
    const uploads = state.uploads.filter(upload => upload.video.id !== action.payload.id);
    if (uploads.length === state.uploads.length) { return state }

    return { uploads }
}

function updateProgress(state = INITIAL_STATE, action: Typings.UpdateProgressAction): Typings.State {
    const videoId = action.payload.video.id;
    const fileField = action.payload.fileField;
    const { indexUpload, indexFile } = findIndexUploadAndFile(state, videoId, fileField);

    if (typeof indexUpload === "undefined" || typeof indexFile === "undefined") { return state }

    const upload = state.uploads[indexUpload];
    const file = upload.files[indexFile];

    const uploads = update(state.uploads, {
        [indexUpload]: {
            $apply(upload) {
                const files = update(upload.files, {
                    [indexFile]: {
                        $set: { ...file, progress: action.payload.progress }
                    }
                })
                const progress = calculateGlobalProgress(files);
                return { ...upload, progress, files }
            }
        }
    });

    return { uploads }
}

function findIndexUploadAndFile(state: Typings.State, videoId: string, fileField: string): { indexUpload?: number, indexFile?: number } {
    const indexUpload = findIndexUpload(state, videoId);
    if (indexUpload === -1) { return {} }

    const files = state.uploads[indexUpload].files;
    const indexFile = findIndexFile(files, fileField);

    return indexFile === -1 ? {} : { indexUpload, indexFile };
}

function calculateGlobalProgress(files: Array<{ progress: number }>): number {
    const countFiles = files.length;
    if (!countFiles) { return 0 }

    const sumProgess = files.reduce((sum, file) => sum = sum + file.progress, 0);

    return sumProgess / countFiles;
}

function findIndexUpload(state: Typings.State, id: string): number {
    return state.uploads.findIndex((upload) => (upload.video.id === id));
}

function findIndexFile(files: Array<{ fileField: string }>, fileField: string): number {
    return files.findIndex((file) => (file.fileField === fileField));
}
