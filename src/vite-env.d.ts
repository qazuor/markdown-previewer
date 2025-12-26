/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_CLIENT_ID: string;
    readonly VITE_GITHUB_REDIRECT_URI: string;
    readonly VITE_CLOUDINARY_CLOUD_NAME: string;
    readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
