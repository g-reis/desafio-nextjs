import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useCookies } from "react-cookie"
import PhoneInput from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'

const SERVER_BASE = 'http://ec2-3-133-82-189.us-east-2.compute.amazonaws.com'

export default function Data({ users, user, tels, token }) {
    const router = useRouter()

    const [cookie, setCookie, removeCookie] = useCookies(["user"])
    const [showModalNewUser, setShowModalNewUser] = useState(false)
    const [showModalNewPhone, setShowModalNewPhone] = useState(false)
    const [invalidPassword, setInvalidPassword] = useState(false)
    const [showModalEditUser, setShowModalEditUser] = useState(false)
    const [showModalEditPhone, setShowModalEditPhone] = useState(false)

    const [erroUser, setErroUser] = useState(false)

    const [localUsers, setLocalUsers] = useState(users)
    const [localTels, setLocalTels] = useState(tels)
    const [phone, setPhone] = useState()
    const [userToEdit, setUserToEdit] = useState();
    const [phoneToEdit, setPhoneToEdit] = useState();

    const onClickSair = async event => {
        removeCookie("user")
        router.push('/')
    }

    async function reloadTels() {
        const resTel = await fetch(
            SERVER_BASE + '/user-data?users_permissions_user.id=' + user.userid,
            {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                method: 'GET'
            }
        )

        setLocalTels(await resTel.json())
    }

    async function reloadUsers() {
        const res = await fetch(
            SERVER_BASE + '/users',
            {
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                method: 'GET'
            }
        )
        if (res.status == 200) {
            setLocalUsers(await res.json())
        }

    }

    const editPhone = async event => {
        event.preventDefault()
        const res = await fetch(
            SERVER_BASE + '/user-data/' + event.target.phoneIdHidden.value,
            {
                body: JSON.stringify({
                    nome: event.target.name.value,
                    telefone: event.target.phone.value,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                method: 'PUT'
            }
        )
        if (res.status == 200) {
            setShowModalEditPhone(false)
            reloadTels()
        }

    }

    const addNewPhone = async event => {
        event.preventDefault()
        const res = await fetch(
            SERVER_BASE + '/user-data',
            {
                body: JSON.stringify({
                    nome: event.target.name.value,
                    telefone: event.target.phone.value,
                    users_permissions_user: {
                        id: user.userid
                    }
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token

                },
                method: 'POST'
            }
        )
        if (res.status == 200) {
            reloadTels()
            setShowModalNewPhone(false)
        }
    }

    async function deletePhone(phoneID) {
        const res = await fetch(
            SERVER_BASE + '/user-data/' + phoneID,
            {
                headers: {
                    'Authorization': 'Bearer ' + token

                },
                method: 'DELETE'
            }

        )
        if (res.status == 200) {
            reloadTels()
        }
    }

    const editUser = async event => {
        event.preventDefault()
        if (event.target.password.value !== event.target.passwordrepeat.value) {
            setInvalidPassword(true)
            return
        }
        const res = await fetch(
            SERVER_BASE + '/users/' + event.target.useridHidden.value,
            {
                body: JSON.stringify({
                    password: event.target.password.value,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                method: 'PUT'
            }
        )
        if (res.status == 200)
            setShowModalEditUser(false)
    }

    const addNewUser = async event => {
        event.preventDefault()
        if (event.target.password.value !== event.target.passwordrepeat.value) {
            setInvalidPassword(true)
            return
        }
        const res = await fetch(
            SERVER_BASE + '/users',
            {
                body: JSON.stringify({
                    username: event.target.username.value,
                    email: event.target.email.value,
                    password: event.target.password.value,
                    confirmed: true,
                    blocked: false,
                    role: { id: 1 }
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token

                },
                method: 'POST'
            }
        )
        if (res.status == 201) {
            reloadUsers()
            setShowModalNewUser(false)
        } else {
            setErroUser(true)
        }
    }

    async function deleteUser(userID) {
        const res = await fetch(
            SERVER_BASE + '/users/' + userID,
            {
                headers: {
                    'Authorization': 'Bearer ' + token

                },
                method: 'DELETE'
            }

        )
        if (res.status == 200) {
            reloadUsers()
        }
    }

    return (
        <>
            <Head>
                <title>Desafio - Area Restrita</title>
            </Head>
            <div className='bg-gray-50 min-h-screen'>
                <div className="flex bg-green-50 shadow">
                    <div className="justify-between w-full flex justfy-between p-3">
                        <span className='self-center text-lg'>Bem vindo, <span className='font-bold'>{user.username}</span>!</span>
                        <button onClick={onClickSair} className="bg-green-500 text-white rounded-lg pl-4 pr-5 py-2 font-bold flex flex-row">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="white">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sair
                        </button>
                    </div>
                </div>

                <div className="flex flex-row">
                    <div className="flex-grow">
                        <div className="m-5">
                            <button onClick={() => {
                                setUserToEdit({
                                    username: '',
                                    email: '',
                                    id: ''
                                })
                                setErroUser(false)
                                setShowModalNewUser(true)
                            }} className="bg-green-500 text-white rounded-lg px-5 py-2 font-bold">Novo Usuário</button>
                        </div>
                        <div className="m-5 border border-gray-200 flex-grow">
                            <div className='text-center border-b border-gray-200 text-lg'>Usuários</div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome de Usuário
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            E-mail
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">

                                        </th>
                                        <th scope="col" className="relative px-6 py-3">

                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">

                                    {
                                        localUsers.map((usr) => (
                                            <>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="black">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-3">{usr.username}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap items-center">{usr.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap items-center"><a href='#' onClick={() => {
                                                        setUserToEdit(usr)
                                                        setShowModalEditUser(true)
                                                    }}>Editar</a></td>
                                                    <td className="px-6 py-4 whitespace-nowrap items-center">{usr.username == user.username ? null : <><a href='#' onClick={() => deleteUser(usr.id)}>Excluir</a></>}</td>
                                                </tr>
                                            </>
                                        ))
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>



                    <div className="flex-grow">
                        <div className="m-5">
                            <button onClick={
                                () => {
                                    setPhoneToEdit({
                                        telefone: '',
                                        nome: '',
                                        id: ''
                                    })
                                    setPhone(null)
                                    setShowModalNewPhone(true)
                                }
                            } className="bg-green-500 text-white rounded-lg px-5 py-2 font-bold">Novo Telefone</button>
                        </div>
                        <div className="m-5 border border-gray-200 flex-grow">
                            <div className='text-center border-b border-gray-200 text-lg'>Telefones</div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Telefone
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">

                                        </th>
                                        <th scope="col" className="relative px-6 py-3">

                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">

                                    {
                                        localTels.map((tel) => (
                                            <>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap">{tel.nome}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap items-center">{tel.telefone}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap items-center"><a href='#' onClick={() => {
                                                        setPhoneToEdit(tel)
                                                        setPhone('+55' + tel.telefone)
                                                        setShowModalEditPhone(true)
                                                    }
                                                    }>Editar</a></td>
                                                    <td className="px-6 py-4 whitespace-nowrap items-center"><a href='#' onClick={() => deletePhone(tel.id)}>Excluir</a></td>
                                                </tr>
                                            </>
                                        ))
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal NewUser */}
            {showModalNewUser || showModalEditUser ? (
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-2 mx-auto max-w-3xl">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                    <span className="font-semibold">
                                        {showModalNewUser ? 'Novo Usuário' : null}
                                        {showModalEditUser ? 'Editar Usuário' : null}
                                    </span>
                                </div>
                                <div className="relative p-6 flex-auto">
                                    <form onSubmit={showModalNewUser ? addNewUser : editUser}>
                                        {erroUser ?
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative space-x-1 mb-4 text-center" role="alert">
                                                <strong className="font-bold">Erro!</strong>
                                                <span className="block sm:inline">O nome de usuário já existe</span>
                                            </div> : null}
                                        <div className="mb-6">
                                            <label htmlFor="username" className="mb-3 block text-gray-700">Nome de Usuário:</label>
                                            <input type="text" id="username" value={userToEdit.username} onChange={setUserToEdit}
                                                className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                                placeholder="Nome de Usuário" required={!showModalEditUser} disabled={showModalEditUser} />
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="email" className="mb-3 block text-gray-700">E-mail:</label>
                                            <input type="email" id="email" value={userToEdit.email} onChange={setUserToEdit}
                                                className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                                placeholder="E-mail" required={!showModalEditUser} disabled={showModalEditUser} />

                                        </div>
                                        <div className='mb-6'>
                                            <div className="flex flex-row">
                                                <div className='mr-2'>
                                                    <label htmlFor="password" className="mb-3 block text-gray-700">Senha:</label>
                                                    <input type="password" id="password"
                                                        className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                                        placeholder="Senha" required />
                                                </div>
                                                <div className='ml-2'>
                                                    <label htmlFor="passwordrepeat" className="mb-3 block text-gray-700">Repita a senha:</label>
                                                    <input type="password" id="passwordrepeat"
                                                        className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                                        placeholder="Repita a enha" required />
                                                </div>
                                            </div>
                                            {invalidPassword ?
                                                <div className="mt-1 text-red-400">
                                                    <a href="#">As senhas digitadas são diferentes</a>
                                                </div> : null}
                                        </div>
                                        <input type='hidden' id='useridHidden' value={userToEdit.id} />
                                        <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                                            <button onClick={() => {
                                                setShowModalNewUser(false)
                                                setShowModalEditUser(false)
                                            }} className="bg-red-500 text-white rounded-lg px-5 py-2 mx-2 font-bold">Fechar</button>
                                            <button type='submit' className="bg-green-500 text-white rounded-lg px-5 py-2 font-bold">Salvar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}

            {/* Modal NewPhone */}
            {showModalNewPhone || showModalEditPhone ? (
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-2 mx-auto max-w-3xl">
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                                    <span className="font-semibold">
                                        {showModalNewPhone ? 'Novo Telefone' : null}
                                        {showModalEditPhone ? 'Editar Telefone' : null}
                                    </span>
                                </div>
                                <div className="relative p-6 flex-auto">
                                    <form onSubmit={showModalNewPhone ? addNewPhone : editPhone}>
                                        <div className="mb-6">
                                            <label htmlFor="name" className="mb-3 block text-gray-700">Nome:</label>
                                            <input type="text" id="name" value={phoneToEdit.nome} onChange={setPhoneToEdit}
                                                className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                                placeholder="Nome" required />
                                        </div>
                                        <div className="mb-6">
                                            <label htmlFor="phone" className="mb-3 block text-gray-700">Telefone:</label>
                                            <PhoneInput id="phone" className="bg-white rounded-md border border-gray-400 p-3 focus:outline-none w-full"
                                                placeholder="Telefone"
                                                value={phone}
                                                country="BR"
                                                onChange={setPhone} />
                                        </div>
                                        <input type='hidden' id='phoneIdHidden' value={phoneToEdit.id} />
                                        <div className="flex items-center justify-end pt-6 border-t border-solid border-blueGray-200 rounded-b">
                                            <button onClick={() => {
                                                setShowModalNewPhone(false)
                                                setShowModalEditPhone(false)
                                            }} className="bg-red-500 text-white rounded-lg px-5 py-2 mx-2 font-bold">Fechar</button>
                                            <button className="bg-green-500 text-white rounded-lg px-5 py-2 font-bold">Salvar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </>
    )
}


export async function getServerSideProps(ctx, req) {
    if (!ctx.req.cookies.user)
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
            props: {},
        };
    const token = JSON.parse(ctx.req.cookies.user).token
    const userid = JSON.parse(ctx.req.cookies.user).userid
    const res = await fetch(
        SERVER_BASE + '/users',
        {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'GET'
        }
    )

    if (res.status != 200) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            },
            props: {},
        };
    }

    const resTel = await fetch(
        SERVER_BASE + '/user-data?users_permissions_user.id=' + userid,
        {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'GET'
        }
    )

    const users = await res.json()
    const tels = await resTel.json()
    const user = JSON.parse(ctx.req.cookies.user)
    return {
        props: {
            users,
            user,
            tels,
            token
        },

    }
}