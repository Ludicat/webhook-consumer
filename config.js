import { existsSync } from 'fs';
import dotenv from "dotenv";

// Load dotenv config
dotenv.config({
    path: '.env',
    override: true
});
if (existsSync('.env.local')) {
    dotenv.config({
        path: '.env.local',
        override: true
    });
}
if (existsSync('.env.' + process.env.APP_ENV)) {
    dotenv.config({
        path: '.env.' + process.env.APP_ENV,
        override: true
    });
}
if (existsSync('.env.' + process.env.APP_ENV)) {
    dotenv.config({
        path: '.env.' + process.env.APP_ENV + '.local',
        override: true
    });
}

export default process.env;