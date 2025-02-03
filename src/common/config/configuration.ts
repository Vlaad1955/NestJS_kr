import * as process from 'process';

export default () => ({
    port: parseInt(process.env.PORT ?? '3001', 10),
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
        password: process.env.DB_PASSWORD,
        user: process.env.DB_USERNAME,
        database: process.env.DB_NAME,
    },
});