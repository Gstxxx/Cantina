import { Context } from "hono";
import { verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { Auth } from "../../types";
import { prisma } from "../../../lib/prisma";

function getAuthToken(c: Context) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
        return { error: "Authorization header missing", status: 401 };
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
        return { error: "Token is required", status: 401 };
    }

    return { token };
}
export const userMiddleware = createMiddleware<{
    Variables: {
        user: Auth;
    };
}>(async (c, next) => {
    const token = getAuthToken(c);
    if (!token.token) {
        return c.json({ error: "Authorization header missing" }, 401);
    }
    try {
        if (!process.env.JWT_SECRET) {
            return c.json({ error: "Missing JWT_SECRET environment variable" }, 500);
        }
        const payload = await verify(token.token, process.env.JWT_SECRET);
        if (!payload.sub) {
            return c.json({ error: "Payload invalid" }, 404);
        }
        const userID = payload.sub as number;

        const user = await prisma.auth.findUnique({ where: { id: userID } });
        if (!user) {
            return c.json({ error: "User not found" }, 404);
        }
        const userAuth: Auth = {
            id: user.id,
            email: user.email,
            password: user.password,
            type: user.type,
            refreshToken: token.token,
        };
        c.set("user", userAuth);
        await next();
    } catch (err) {
        if (err.name === 'JwtTokenExpired') {

            return c.json({ message: 'Token has expired, please log in again.' }, 401);
        } else {
            return c.json({ message: 'Unauthorized access.' }, 401);
        }
    }
});

export const adminMiddleware = createMiddleware<{
    Variables: {
        user: Auth;
    };
}>(async (c, next) => {
    const user = c.get("user");
    if (user.type !== "Admin") {
        return c.json(
            { error: "Access denied. Only admins can access this route." },
            403,
        );
    }
    await next();
});