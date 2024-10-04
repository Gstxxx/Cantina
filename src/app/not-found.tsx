import Link from 'next/link'

const NotFoundPage = () => {
    return (
        <div className="mt-52 flex flex-col items-center font-semibold">
            <h1>404 - Página não encontrada</h1>
            <p>Desculpe, a página que você está procurando não existe.</p>
            <Link href="/" replace className="text-blue-500">
                Voltar para a página inicial
            </Link>
        </div>
    );
};

export default NotFoundPage;