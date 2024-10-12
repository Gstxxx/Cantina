'use client'
import { submit as submitLoginForm } from "./login";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from 'cookies-next';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export async function action(formData: FormData) {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    const result = await submitLoginForm({ email, password });

    if (result.ok) {
        const response = await result.json();
        if ('token' in response && 'tokenRefresh' in response) {
            setCookie("token", response.token);
            setCookie("refreshToken", response.tokenRefresh);
            return { success: true, redirectTo: "/dashboard" };
        }
        else {
            console.log(response);
            return { error: "Invalid response from server" };
        }
    } else {
        return { error: "Invalid email or password." };
    }
}

const LoginPage = () => {
    const [state, setState] = useState<{ error: string | null; isLoading: boolean }>({ error: null, isLoading: false });
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setState({ ...state, error: null, isLoading: true });
        try {
            const result = await submitLoginForm(data);

            if (result.ok) {
                const response = await result.json();
                if ('token' in response && 'tokenRefresh' in response) {
                    setCookie("token", response.token);
                    setCookie("refreshToken", response.tokenRefresh);
                    router.push("/dashboard/purchases");
                } else {
                    setState({ ...state, error: "Invalid response from server", isLoading: false });
                }
            } else {
                const errorData = await result.json();
                setState({ ...state, error: errorData.error || "An error occurred. Please try again.", isLoading: false });
            }
        } catch (error) {
            console.error("An error occurred:", error);
            setState({ ...state, error: "An error occurred. Please try again.", isLoading: false });
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <div className="bg-[#272b2f] border-transparent border-0 flex items-center justify-center h-screen">
            <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg bg-[#222527] border-transparent border-0 p-10 w-[400px]">
                <h2 className="text-lg font-bold mb-4 text-orange-500 font-bold">Login</h2>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-orange-500">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full border rounded-md p-2 text-white bg-[#272b2f] border-transparent border-0 active:border-orange-500"
                        required
                        {...register("email")}
                    />
                    {errors.email && <p className="text-xl font-bold text-red-500 m-4">{errors.email.message as string}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-orange-500">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="mt-1 block w-full border rounded-md p-2 text-white bg-[#272b2f] border-transparent border-0 active:border-orange-500"
                        required
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
                </div>
                <button type="submit" className="w-full bg-orange-500 text-white p-2 rounded" disabled={state.isLoading}>
                    {state.isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;