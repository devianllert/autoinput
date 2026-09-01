/// <reference types="electron-vite/node" />

interface ImportMetaEnv {
  readonly VITE_AUTOINPUT_ENABLE_DEV_UPDATER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
