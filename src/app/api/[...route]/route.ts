import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel'
import { clientApp } from "../clients";
import { productApp } from "../product/index";
import { purchaseApp } from "../purchases/index";
import { authApp } from "../auth/login";

const mainApp = new Hono();

mainApp.use('/*', cors());

const routes = mainApp.route('/api', authApp).route('/api', clientApp).route('/api', productApp).route('/api', purchaseApp);

export const GET = handle(routes);

export const POST = handle(routes);

export type AppType = typeof routes;
