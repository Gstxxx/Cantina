'use client'
import { submit as submitLoginForm } from "./login";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
            localStorage.setItem("token", response.token);
            localStorage.setItem("refreshToken", response.tokenRefresh);
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
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("refreshToken", response.tokenRefresh);
                    router.push("/dashboard");
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
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow-md">
                <h2 className="text-lg font-bold mb-4">Login</h2>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="mt-1 block w-full border rounded-md p-2"
                        required
                        {...register("email")}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="mt-1 block w-full border rounded-md p-2"
                        required
                        {...register("password")}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={state.isLoading}>
                    {state.isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;