'use client'
import { submit as submitLoginForm } from "./login";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from 'cookies-next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
    email: z.string().email({ message: "Endereço de email inválido" }),
    password: z.string().min(8, { message: "Senha deve ter ao menos 8 caracteres" }),
});

export async function action(formData: FormData) {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
        return { error: "Email e senha são obrigatórios." };
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
            return { error: "Resposta inválida do servidor" };
        }
    } else {
        return { error: "Email ou senha inválidos." };
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
                    router.push("/Dashboard/Purchases");

                } else {
                    setState({ ...state, error: "Resposta inválida do servidor", isLoading: false });
                }
            } else {
                const errorData = await result.json();
                setState({ ...state, error: errorData.error || "Ocorreu um erro. Por favor, tente novamente.", isLoading: false });
            }
        } catch (error) {
            console.error("Ocorreu um erro:", error);
            setState({ ...state, error: "Ocorreu um erro. Por favor, tente novamente.", isLoading: false });
        } finally {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Entre na sua conta</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="email" className="sr-only">
                                Endereço de email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                placeholder="Endereço de email"
                                {...register("email")}
                            />
                            {errors.email && <p className="text-xl font-bold text-red-500 m-4">{errors.email.message as string}</p>}
                        </div>
                        <div>
                            <Label htmlFor="password" className="sr-only">
                                Senha
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                placeholder="Senha"
                                {...register("password")}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
                        </div>
                        <div>
                            <Button type="submit" className="w-full bg-orange-500 text-white p-2 rounded" disabled={state.isLoading}>
                                {state.isLoading ? "Carregando..." : "Entrar"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
