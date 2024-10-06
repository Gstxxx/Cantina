import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submit as submitCreateProduct } from './create';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

export async function action(formData: FormData) {
    const intent = formData.get("intent");

    if (intent === "Create-Product") {
        const name = formData.get("name")?.toString();
        const price = Number(formData.get("price"));

        if (!name || isNaN(price)) {
            return { error: "Nome e preço são obrigatórios." };
        }

        const priceInCents = price;
        console.log(priceInCents);
        const result = await submitCreateProduct({ name, price: priceInCents });
        if (result.ok) {
            return { success: "Produto criado com sucesso" };
        }
        return { error: "Produto não foi criado." };
    }
    return { error: "Invalid intent." };
}

export function CreateProduct() {
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

    return (
        <form onSubmit={handleSubmit} className='rounded-lg bg-[#272b2f] border-transparent border-0 max-h-[80vh] overflow-auto max-h-[325px]'>
            <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-orange-500">Criar Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='text-orange-500'>Nome</label>
                            <Input className='bg-[#222527] border-transparent border-0 p-4 active:border-orange-500 mt-4 mb-4' type="text" placeholder="Nome" name="name" />
                        </div>
                        <div>
                            <label className='text-orange-500'>Preço</label>
                            <div className='relative'>
                                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500'>R$</span>
                                <Input
                                    className='bg-[#222527] border-transparent border-0 p-4 pl-10 active:border-orange-500 mt-4'
                                    type="text"
                                    placeholder="Preço"
                                    name="price"
                                    value={price}
                                    onChange={handlePriceChange}
                                />
                            </div>
                        </div>
                    </div>
                    <input type="hidden" name="intent" value="Create-Product" />
                    <Button className='bg-orange-500 text-white p-4 active:border-orange-500 my-4 w-full' type='submit'>Criar</Button>
                </CardContent>
            </Card>
        </form>
    );
}
