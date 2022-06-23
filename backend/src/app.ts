import path from 'path';

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import * as databaseConfig from './config/database';
import * as sessionConfig from './config/session';



mongoose.connect(databaseConfig.database);

mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + databaseConfig.database);
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err);
});

const app = express();



import apikeys from './routes/apikeys';
import audit from './routes/audit';
import devices from './routes/devices';
import download from './routes/download';
import frontEnd from './routes/front-end';
import users from './routes/users';
import upload from './routes/upload';



app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: sessionConfig.secret,
}));



app.use(passport.initialize());
app.use(passport.session());
import './config/passport'; // ??



app.use('/upload', upload);

app.use(bodyParser.json());

app.use('/apikeys', apikeys);
app.use('/audit', audit);
app.use('/devices', devices);
app.use('/download', download);
app.use('/front-end', frontEnd);
app.use('/users', users);



import * as specs from './swagger';
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs)
);



app.listen(3000, () => {
    console.log('Server started on port ' + port);
});
