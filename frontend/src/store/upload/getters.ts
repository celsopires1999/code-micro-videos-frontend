import { Upload, UploadState } from "./types";

export function countInProgress(uploads: Upload[]): number {
    return uploads.filter(upload => isFinished(upload)).length

}

export function isFinished(upload: Upload): boolean {
    return upload.progress === 1;
}
