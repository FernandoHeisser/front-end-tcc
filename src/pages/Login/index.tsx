import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router';
import api from '../../services/api';
import Stock from '../../models/Stock'
import User from '../../models/User';
import './login.css';

const Login = () => {
    const navigate = useNavigate();
    const [loginFlag, setLoginFlag] = useState(false);
    const [id, setId] = useState<string>();
    const [selectedStock, setSelectedStock] = useState<string>('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [userStocks, setUserStocks] = useState<string[]>([]);
    const [responseFlag, setResponseFlag] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if(userStocks.length === 0)
            return

        let stockList: Stock[] = [];
        userStocks.forEach(stock => {
            stockList.push({
                symbol: stock
            });
        });

        const user: User = {
            stocks: stockList
        };

        const response = await api.post('/users', user);
        
        localStorage.setItem('userId', response.data);
        localStorage.setItem('first-time-flag', "true");
        
        navigate('/home');
    }

    function handleId(event: ChangeEvent<HTMLInputElement>) {
        const _id = event.target.value;
        setId(_id);
    }

    async function submitLogin() {
        try {
            const response = await api.get(`/users/${id}`);
            
            localStorage.setItem('userId', response.data._id);
        
            navigate('/home');

        } catch (e) {
            setResponseFlag(true);
        }
    }

    function handleSelected(event: ChangeEvent<HTMLSelectElement>) {
        const selectedStock = (event.target.value);
        setSelectedStock(selectedStock);
    }

    function addStock() {
        let stocks = userStocks;
        if(!stocks.includes(selectedStock) && selectedStock !== '')
            stocks.push(selectedStock);
        setUserStocks(stocks);
        setSelectedStock('');
    }

    function compare(a: Stock, b: Stock) {
        if (a.symbol !== undefined && b.symbol !== undefined && a.symbol < b.symbol) {
            return -1;
        }
        if (a.symbol !== undefined && b.symbol !== undefined && a.symbol > b.symbol) {
            return 1;
        }
        return 0;
    }

    function removeStock(param: string) {
        let stocks: string[] = [];
        userStocks.forEach(stock => {
            if(stock !== param)
                stocks.push(stock);
        });
        setUserStocks(stocks);
        setSelectedStock('');
    }

    useEffect(() => {
        async function getStocks() {
            const response = await api.get('stocks');
            setStocks(response.data.content.sort(compare));
            localStorage.setItem('stocks', JSON.stringify(response.data.content.sort(compare)));
        }
        getStocks();
    }, []);

    return (
        <>
            <main className='login-main'>
                <div className='left'>
                    <h1 className='login-title'>Minha carteira</h1>
                    <p className='login-span'>Adicione as ações de seu interesse</p>
                </div>
                <form onSubmit={handleSubmit}>
                    {loginFlag ?
                        <div className='right-column'>
                            <p className='login-p'>Faça o login usando seu código identificador:</p>
                            <input type='text' className='login-input' onChange={handleId}></input>
                            <button type='button' className='login' onClick={submitLogin}>Entrar</button>
                            <button type='button' className='button-link-2' onClick={()=>setLoginFlag(!loginFlag)}>Cadastrar</button>
                        </div>
                    :
                        <div className='right'>
                            <div className='inside-left'>
                                <select name="stocks" id="stocks" className='login-input' value={selectedStock} onChange={handleSelected}>
                                    <option value="0">Selecione uma ação</option>
                                    {stocks.map(stock => (
                                        <option key={stock._id} value={stock.symbol}>{stock.symbol}</option>
                                    ))}
                                </select>
                                <div className='stock-list'>
                                    <p>{userStocks.length === 0 ? null : 'Ações adicionadas:'}</p>
                                    {userStocks.map(stock => (
                                        <div className='stock-item' key={stock}>
                                            <p className='stock-symbol' key={stock}>{stock}</p>
                                            <span onClick={() => removeStock(stock)}><IoMdClose></IoMdClose></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className='inside-right'>
                                <button type='button' className='login' onClick={addStock} >Adicionar</button>
                                <button type='submit' className='login' >Começar</button>
                                <button type='button' className='button-link' onClick={()=>setLoginFlag(!loginFlag)}>Login</button>
                            </div>
                        </div>
                    }
                </form>
            </main>
            {responseFlag ?
                <div className='pop-up-background'>
                    <div className='pop-up-add-stocks'>
                        <p>Usuário não encontrado.</p>
                        <button type='button' className='login' onClick={()=>{setResponseFlag(!responseFlag)}}>Ok</button>
                    </div>
                </div>
            :
                <></>
            }
        </>
    );
}
export default Login;