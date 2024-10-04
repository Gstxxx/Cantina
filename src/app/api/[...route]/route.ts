import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel'
import { clientApp } from "../clients";
import { productApp } from "../product/index";
import { purchaseApp } from "../purchases/index";
import { authApp } from "../auth/login";
export const runtime = {
    runtime: 'edge',
};

const mainApp = new Hono();

mainApp.use('/*', cors());

mainApp.route('/api', authApp);
mainApp.route('/api', clientApp);
mainApp.route('/api', productApp);
mainApp.route('/api', purchaseApp);

export const GET = handle(mainApp);

export const POST = handle(mainApp);


