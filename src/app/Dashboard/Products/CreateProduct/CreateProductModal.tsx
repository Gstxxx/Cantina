import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";
import { submit as submitCreateProduct } from './create';
import { useToast } from "@/hooks/use-toast";
import { Tag, DollarSign, X } from 'lucide-react';

export async function action(formData: FormData) {
    const intent = formData.get("intent");

    if (intent === "Create-Product") {
        const name = formData.get("name")?.toString();
        const price = Number(formData.get("price"));

        if (!name || isNaN(price)) {
            return { error: "Nome e preço são obrigatórios." };
        }

        const priceInCents = price;
        const result = await submitCreateProduct({ name, price: priceInCents });
        if (result.ok) {
            return { success: "Produto criado com sucesso" };
        }
        return { error: "Produto não foi criado." };
    }
    return { error: "Invalid intent." };
}

const CreateProductModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const { toast } = useToast();
    const [price, setPrice] = useState<string>("0.00");

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value.replace(/\D/g, "");

        if (inputValue.length > 0) {
            const cleanedInput = inputValue.replace(/^0+/, "");
            const paddedInput = cleanedInput.padStart(3, "0");
            const formattedPrice = `${paddedInput.slice(0, -2)}.${paddedInput.slice(-2)}`;

            setPrice(formattedPrice);
        } else {
            setPrice("0.00");
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        // Convert the price to cents by removing the decimal and multiplying by 100
        const priceInCents = Math.round(parseFloat(price) * 100);
        formData.set("price", priceInCents.toString());

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
                    <h2 className="text-xl font-semibold text-white">Criar Produto</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="flex items-center">
                                <Tag className="text-gray-500 mr-2" />
                                <label className="text-orange-500">Nome</label>
                            </div>
                            <Input className="bg-gray-100 border-transparent border-0 p-4 active:border-orange-500 mt-4 mb-4" type="text" placeholder="Nome" name="name" />
                        </div>
                        <div>
                            <div className="flex items-center">
                                <DollarSign className="text-gray-500 mr-2" />
                                <label className="text-orange-500">Preço</label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500">R$</span>
                                <Input
                                    className="bg-gray-100 border-transparent border-0 p-4 pl-10 active:border-orange-500 mt-4 text-orange-500"
                                    type="text"
                                    placeholder="Preço"
                                    name="price"
                                    value={price}
                                    onChange={handlePriceChange}
                                />
                            </div>
                        </div>
                        <input type="hidden" name="intent" value="Create-Product" />
                        <div className="flex justify-end gap-4">
                            <Button className="bg-green-500 text-white p-4 active:border-green-400 hover:bg-green-600" type="submit">Criar</Button>
                            <Button className="bg-red-500 text-white p-4 active:border-red-400 hover:bg-red-600" onClick={() => setIsModalOpen(false)}>Fechar</Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProductModal;
