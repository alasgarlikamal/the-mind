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
        synchronize: true,
    },

    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },

    jwtSecret: process.env.JWT_SECRET,

    mailHost: process.env.MAIL_HOST,
    mailPassword: process.env.MAIL_PASSWORD,
    mailUser: process.env.MAIL_USER ,
    mailFrom: process.env.MAIL_FROM,
   
})