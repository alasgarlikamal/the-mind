import { entities } from "./db.entities";

export const config = () => ({
    database: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        entities,
        synchronize: true
    },
    jwtSecret: process.env.JWT_SECRET
})