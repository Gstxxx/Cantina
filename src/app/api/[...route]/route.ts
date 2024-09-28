import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel'
import { clientApp } from "../clients/client.js";
import { clientsApp } from "../clients/index.js";

export const config = {
    runtime: 'edge',
};

const mainApp = new Hono();

mainApp.use('/*', cors());

mainApp.route('/', clientsApp);
mainApp.route('/', clientApp);

export default handle(mainApp);


