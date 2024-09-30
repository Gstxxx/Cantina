import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel'
import { clientApp } from "../clients/client";
import { clientsApp } from "../clients/index";

export const runtime = {
    runtime: 'edge',
};

const mainApp = new Hono();

mainApp.use('/*', cors());

mainApp.route('/api', clientsApp);
mainApp.route('/api', clientApp);

export const GET = handle(mainApp);

export const POST = handle(mainApp);

