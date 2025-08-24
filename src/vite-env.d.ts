/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Add support for importing markdown files as strings
declare module '*.md' {
  const content: string;
  export default content;
}
