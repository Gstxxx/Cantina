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

export function CreateClient() {
    const { toast } = useToast()
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await action(formData);

        if (result.success) {
            toast({
                description: result.success,
            })
            window.location.reload();
        } else if (result.error) {
            alert(result.error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='rounded-lg bg-[#272b2f] border-transparent border-0 overflow-auto max-h-[320px]'>

            <Card className='rounded-lg bg-[#272b2f] border-transparent border-0'>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-orange-500">Criar Cliente</CardTitle>
                </CardHeader>
                <CardContent >
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <label className='text-orange-500'>Nome</label>
                            <Input className='bg-[#222527] border-transparent border-0 p-4 active:border-orange-500 mt-4 mb-4' type="text" placeholder="Nome" name="name" />
                        </div>
                        <div>
                            <label className='text-orange-500'>Celular</label>
                            <Input className='bg-[#222527] border-transparent border-0 p-4 active:border-orange-500 mt-4' type="text" placeholder="Celular" name="phone" onKeyPress={(e) => {
                                const input = e.target as HTMLInputElement;
                                const { value } = input;
                                const maxLength = 15;
                                const field = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})(\d+?)/, '$1');
                                if (field.length >= maxLength) e.preventDefault();
                                else input.value = field;
                            }} />
                        </div>
                    </div>
                    <input type="hidden" name="intent" value="Create-User" />
                    <Button className='bg-orange-500 text-white p-4 active:border-orange-500 my-4 w-full' type='submit'>Criar</Button>

                </CardContent>
            </Card>
        </form>
    )
}
