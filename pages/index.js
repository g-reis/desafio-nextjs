import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useCookies } from "react-cookie"

const SERVER_BASE = 'http://ec2-3-133-82-189.us-east-2.compute.amazonaws.com'

export default function Home() {
    const router = useRouter()
    var [erroLogin, setErroLogin] = useState(false);
    const [cookie, setCookie] = useCookies(["user"])

    const loginUser = async event => {
        event.preventDefault() // don't redirect the page
        // where we'll add our form logic

        const res = await fetch(
            SERVER_BASE + '/auth/local',
            {
                body: JSON.stringify({
                    identifier: event.target.username.value,
                    password: event.target.password.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }
        )
        if (res.status == 200) {
            const result = await res.json()
            localStorage.setItem('jwt', result.jwt)

            setCookie("user", JSON.stringify({ "username": result.user.username, "token": result.jwt, "userid": result.user.id }), {
                path: "/",
                maxAge: 3600, // Expires after 1hr
                sameSite: true,
            })
            router.push('/data')
        }
        else {
            setErroLogin(true)
        }
    }

    return (
        <>
            <Head>
                <title>Desafio - Login</title>
            </Head>

            <div className="flex flex-col p-4 bg-gray-50 min-h-screen">
                <div className="flex flex-col self-center p-8 w-96 bg-green-200 rounded-lg shadow mt-20">
                    <div className="rounded-full bg-green-600 w-32 h-32 -mt-24 mb-5 self-center shadow-sm flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 self-center" fill="none" viewBox="0 0 24 24"
                            stroke="#f9fafb">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <form onSubmit={loginUser}>
                        {erroLogin ?
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative space-x-1 mb-4 text-center" role="alert">
                                <strong className="font-bold">Erro!</strong>
                                <span className="block sm:inline">Usuário ou senha inválidos</span>
                            </div> : null}
                        <div className="mb-6">
                            <label htmlFor="username" className="mb-3 block text-gray-700">Nome de Usuário:</label>
                            <input type="text" id="username"
                                className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                placeholder="Nome de Usuário" required />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="mb-3 block text-gray-700">Senha:</label>
                            <input type="password" id="password"
                                className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                placeholder="Senha" required />
                        </div>

                        <button className="mb-1 bg-green-500 text-white rounded-lg p-3 font-bold w-full">
                            Entrar
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
