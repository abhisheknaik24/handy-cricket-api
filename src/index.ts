import './config';

import cors from 'cors';
import express, { Express } from 'express';
import matchRoutes from './routes/matchRoutes';
import teamRoutes from './routes/teamRoutes';
import tournamentRoutes from './routes/tournamentRoutes';

const app: Express = express();

const port: number = Number(process.env.PORT) || 8000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: process.env.CLIENT_METHODS,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use('/api/tournaments', tournamentRoutes);

app.use('/api/teams', teamRoutes);

app.use('/api/matches', matchRoutes);

app.listen(port);
