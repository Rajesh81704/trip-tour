declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
            PORT: string;
            MONGODB_URI: string;
            CLOUDINARY_CLOUD_NAME: string;
            CLOUDINARY_API_KEY: string;
            CLOUDINARY_API_SECRET: string;
            FRONTEND_URL_DEV: string;
            FRONTEND_URL_PROD: string;
        }
    }
}

export { };
