import { prisma } from '../../../lib/prisma';
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { sign } from "hono/jwt";
import bcrypt from 'bcrypt';
import { userMiddleware } from '../middlewere/authmiddlewere';

const zLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const authApp = new Hono()
    .post("/login", zValidator("json", zLoginSchema), async (c) => {
        try {
            const data = c.req.valid("json");
            const user = await prisma.auth.findUnique({
                where: { email: data.email },
            });

            if (!user) {
                return c.json({ error: "Invalid email or password" }, 404);
            }

            const verifyPassword = await bcrypt.compare(data.password, user.password);

            if (!verifyPassword) {
                return c.json({ error: "Invalid password" }, 404);
            }

            const payload = {
                sub: user.id,
                role: user.type,
                exp: Math.floor(Date.now() / 1000) + 60 * 15,
            };
            if (!process.env.JWT_SECRET) {
                return c.json(
                    { error: "Missing JWT_SECRET environment variable" },
                    500,
                );
            }
            const token = await sign(payload, process.env.JWT_SECRET);

            c.res.headers.append('Set-Cookie', `jwt=${token}; HttpOnly; Path=/; Max-Age=86400;`);

            const payloadRefresh = {
                sub: user.id,
                role: user.type,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            };
            if (!process.env.JWT_REFRESH_SECRET) {
                return c.json(
                    { error: "Missing JWT_REFRESH_SECRET environment variable" },
                    500,
                );
            }
            const tokenRefresh = await sign(payloadRefresh, process.env.JWT_REFRESH_SECRET);

            c.res.headers.append('Set-Cookie', `refreshToken=${tokenRefresh}; HttpOnly; Path=/; Max-Age=604800;`);

            const { password: _, ...userWithoutPassword } = user;

            return c.json({ token, tokenRefresh, user: userWithoutPassword }, 200);
        } catch (err) {
            console.error(err);
            return c.json({ error: "Internal server error" }, 500);
        }
    })
    .post('/refresh', userMiddleware, zValidator('json', z.object({ tokenRefresh: z.string() })), async (c) => {
        try {
            const data = c.req.valid("json");
            const user = c.get("user");
            const tokenRefresh = data.tokenRefresh;

            const refreshToken = await prisma.refreshToken.findUnique({
                where: { token: tokenRefresh },
            });

            if (!refreshToken) {
                return c.json({ error: "Invalid refresh token" }, 401);
            }

            if (refreshToken.authId !== user.id) {
                return c.json({ error: "Refresh token does not match user" }, 401);
            }

            const payload = {
                sub: user.id,
                role: user.type,
                exp: Math.floor(Date.now() / 1000) + 60 * 15,
            };

            if (!process.env.JWT_SECRET) {
                return c.json({ error: "Missing JWT_SECRET environment variable" }, 500);
            }

            const newAccessToken = await sign(payload, process.env.JWT_SECRET);

            const newRefreshPayload = {
                sub: user.id,
                role: user.type,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            };

            if (!process.env.JWT_REFRESH_SECRET) {
                return c.json({ error: "Missing JWT_REFRESH_SECRET environment variable" }, 500);
            }

            const newRefreshToken = await sign(newRefreshPayload, process.env.JWT_REFRESH_SECRET);

            c.res.headers.append('Set-Cookie', `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=604800;`);

            return c.json({ accessToken: newAccessToken, refreshToken: newRefreshToken }, 200);
        }
        catch (err) {
            console.error(err);
            return c.json({ error: "Internal server error" }, 500);
        }
    });

export { authApp };

