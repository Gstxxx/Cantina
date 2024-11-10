import React, { useState } from 'react';
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { submit as submitCreateUser } from './create';
import { useToast } from "@/hooks/use-toast"

export async function action(formData: FormData) {
    const intent = formData.get("intent");

    if (intent === "Create-User") {
        const name = formData.get("name")?.toString();
        const phone = formData.get("phone")?.toString();
        if (!name || !phone) {
            return { error: "Nome e telefone são obrigatórios." };
        }
        const result = await submitCreateUser({ name, phone });
        if (result.ok) {
            // toast("Cliente criado com sucesso");
            return { success: "Cliente criado com sucesso" };
        }
        return { error: "Cliente não foi criado." };
    }
    return { error: "Invalid intent." };
}

const CreateClientModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const { toast } = useToast();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await action(formData);

        if (result.success) {
            toast({
                description: result.success,
            });
            window.location.reload();
        } else if (result.error) {
            alert(result.error);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className='modal fixed inset-0 rounded-lg bg-gray-100/50 border-transparent border-0 flex items-center justify-center z-50'>
            <Card className='w-full max-w-lg mx-auto bg-white text-gray-400 border-transparent border-0 rounded-lg shadow-md'>
                <CardHeader>
                    <CardTitle className="text-4xl font-semibold text-orange-500">Criar Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='text-orange-500'>Nome</label>
                            <Input className='bg-gray-100 border-transparent border-0 p-4 active:border-orange-500 mt-4 mb-4' type="text" placeholder="Nome" name="name" />
                        </div>
                        <div>
                            <label className='text-orange-500'>Celular</label>
                            <Input className='bg-gray-100 border-transparent border-0 p-4 active:border-orange-500 mt-4' type="text" placeholder="Celular" name="phone" onKeyPress={(e) => {
                                const input = e.target as HTMLInputElement;
                                const { value } = input;
                                const maxLength = 15;
                                const field = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})(\d+?)/, '$1');
                                if (field.length >= maxLength) e.preventDefault();
                                else input.value = field;
                            }} />
                        </div>
                        <input type="hidden" name="intent" value="Create-User" />
                        <div className='flex justify-end gap-4'>
                            <Button className='bg-green-500 text-white p-4 active:border-green-400 hover:bg-green-600' type='submit'>Criar</Button>
                            <Button className='bg-red-500 text-white p-4 active:border-red-400 hover:bg-red-600' onClick={() => setIsModalOpen(false)}>Fechar</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateClientModal;
