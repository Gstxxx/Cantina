import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submit as submitCreateProduct } from './create';
import { useToast } from "@/hooks/use-toast";

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
        <div className='modal fixed inset-0 rounded-lg bg-gray-100/50 border-transparent border-0 flex items-center justify-center z-50'>
            <Card className='w-full max-w-lg mx-auto bg-white text-gray-400 border-transparent border-0 rounded-lg shadow-md'>
                <CardHeader>
                    <CardTitle className="text-4xl font-semibold text-orange-500">Criar Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='text-orange-500'>Nome</label>
                            <Input className='bg-gray-100 border-transparent border-0 p-4 active:border-orange-500 mt-4 mb-4' type="text" placeholder="Nome" name="name" />
                        </div>
                        <div>
                            <label className='text-orange-500'>Preço</label>
                            <div className='relative'>
                                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500'>R$</span>
                                <Input
                                    className='bg-gray-100 border-transparent border-0 p-4 pl-10 active:border-orange-500 mt-4'
                                    type="text"
                                    placeholder="Preço"
                                    name="price"
                                    value={price}
                                    onChange={handlePriceChange}
                                />
                            </div>
                        </div>
                        <input type="hidden" name="intent" value="Create-Product" />
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

export default CreateProductModal;
