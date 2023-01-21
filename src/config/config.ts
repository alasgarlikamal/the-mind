export const config = () => ({
    database: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoLoadEntities: true,
        synchronize: true,
    },

    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379
    },

    jwtSecret: process.env.JWT_SECRET,

    mailHost: process.env.MAIL_HOST,
    mailPassword: process.env.MAIL_PASSWORD,
    mailUser: process.env.MAIL_USER,
    mailFrom: process.env.MAIL_FROM,
    emailConfirmUrl: process.env.EMAIL_CONFIRMATION_URL,
    passwordConfirmUrl: process.env.PASSWORD_CONFIRMATION_URL,

    frontEndUrl: process.env.FRONTEND_URL,
});
