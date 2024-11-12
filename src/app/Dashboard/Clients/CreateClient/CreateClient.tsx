import React, { useState } from 'react';
import { Input } from '@/components/ui/input'
import { submit as submitCreateUser } from './create';
import { useToast } from "@/hooks/use-toast"
import { User, Phone, X } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Criar Cliente</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center">
                            <User className="text-gray-500 mr-2" />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        </div>
                        <Input className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" type="text" placeholder="Nome" name="name" />

                        <div className="flex items-center">
                            <Phone className="text-gray-500 mr-2" />
                            <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                        </div>
                        <Input className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400" type="text" placeholder="Celular" name="phone" onKeyPress={(e) => {
                            const input = e.target as HTMLInputElement;
                            const { value } = input;
                            const maxLength = 15;
                            const field = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})(\d+?)/, '$1');
                            if (field.length >= maxLength) e.preventDefault();
                            else input.value = field;
                        }} />
                        <input type="hidden" name="intent" value="Create-User" />
                    </form>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Criar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateClientModal;
