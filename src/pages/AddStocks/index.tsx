import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router';
import './addStocks.css';
import Stock from '../../models/Stock';
import User from '../../models/User';
import api from '../../services/api';

const AddStocks = () => {
    const navigate = useNavigate();
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [responseFlag, setResponseFlag] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string>();
    const [selectedStock, setSelectedStock] = useState<string>('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [user, setUser] = useState<User>();
    const [userStocks, setUserStocks] = useState<string[]>([]);

    function handleLogout(){
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            navigate('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    function handleSelected(event: ChangeEvent<HTMLSelectElement>) {
        const selectedStock = (event.target.value);
        setSelectedStock(selectedStock);
    }

    function addStock() {
        let stocks = userStocks;
        if(!stocks.includes(selectedStock))
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

    function checkIncludes(stock: Stock) {
        if(stock.symbol !== undefined)
            return userStocks.includes(stock.symbol);
        return false;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        var _user = user;
        if(_user !== undefined){
            var _stocks = _user?.stocks.filter(checkIncludes);
            _user.stocks = _stocks !== undefined ? _stocks : [];

            userStocks.forEach(stock => {
                let notContains = _user?.stocks.find(s => s.symbol === stock) === undefined;
                if(notContains && _user !== undefined){
                    _user.stocks.push({
                        symbol: stock
                    });
                }
            });
            setUser(_user);
            const response = await api.put('/users', _user);

            if(response.status === 200){
                setResponseFlag(true);
                setResponseMessage('Salvo com sucesso');
            } else {
                setResponseFlag(true);
                setResponseMessage('Salvo com sucesso');
            }
        }
    }

    useEffect(() => {
        (async function () {
            const userId = localStorage.getItem('userId');

            if(userId === undefined || userId === null) {
                navigate('/');
            }

            const response_stocks = await api.get('stocks');
            setStocks(response_stocks.data.content.sort(compare));

            const response_user = await api.get(`users/${userId}`);
            const user: User = response_user.data;
            
            setUser(user);

            var userStocks: string[] = [];
            user.stocks.forEach(stock => {
                if(stock.symbol !== undefined)
                    userStocks.push(stock.symbol);
            });
            setUserStocks(userStocks);

            setLoadingFlag(true);
        })();
    }, []);

    return (
        <main>
            {
            loadingFlag ?
                <>
                    <div className='content-add-stocks'>
                        <div className='top-bar-add-stocks'>
                            <div className='top-bar-add-stocks-left'>
                                <div className="menu-button" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                </div>
                            </div>
                            <div className='top-bar-add-stocks-center'>
                                <p>Adicionar Ações</p>
                            </div>
                            <div className='top-bar-add-stocks-right'>
                            </div>
                        </div>  
                        <div className={sideMenuFlag?'side-menu-add-stocks':'side-menu-add-stocks-hidden'}>
                            <div className="menu-button-add-stocks" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                <div className="bar-white-add-stocks"></div>
                                <div className="bar-white-add-stocks"></div>
                                <div className="bar-white-add-stocks"></div>
                            </div>
                            <div className='div-logout-add-stocks'>
                                <p className='menu-add-stocks-item' onClick={handleLogout}>Sair</p>
                            </div>
                            <div className='menu-add-stocks'>
                                <p className='menu-add-stocks-item' onClick={()=>navigate('/home')}>Página Principal</p>
                                <p className='menu-add-stocks-item' onClick={()=>navigate('/apriori')}>Análise Apriori</p>
                            </div>
                        </div>
                        <div className='main-add-stocks'>
                            <form onSubmit={handleSubmit} className='add-stocks-form'>
                                <div className='main-add-stocks-left'>
                                    <h5 className='stock-list-title'>Ações adicionadas:</h5>
                                    {userStocks.map(stock => (
                                        <div className='stock-item' key={stock}>
                                            <p className='stock-symbol' key={stock}>{stock}</p>
                                            <span onClick={() => removeStock(stock)}><IoMdClose></IoMdClose></span>
                                        </div>
                                    ))}
                                </div>
                                <div className='main-add-stocks-right'>
                                    <select name="stocks" id="stocks" className='add-stocks-select' value={selectedStock} onChange={handleSelected}>
                                        <option value="0">Selecione uma ação</option>
                                        {stocks.map(stock => (
                                            <option key={stock._id} value={stock.symbol}>{stock.symbol}</option>
                                        ))}
                                    </select>
                                    <button type='button' className='add-stocks-button' onClick={addStock} >Adicionar</button>
                                    <button type='submit' className='add-stocks-button' >Salvar</button>
                                </div>
                            </form>
                        </div>
                        <div className='footer'>
                            <div className='footer-right'>Fernando Heisser</div>
                            <div className='footer-center'>Sistema de Apoio para Análise de Ações da Bolsa de Valores</div>
                            <div className='footer-left'>2022</div>
                        </div>
                    </div>
                    {responseFlag ?
                        <div className='pop-up-background-add-stocks'>
                            <div className='pop-up-add-stocks'>
                                <p>{responseMessage}</p>
                                <button type='button' className='login' onClick={()=>{setResponseFlag(!responseFlag)}}>Ok</button>
                            </div>
                        </div>
                    :
                        <></>
                    }
                </>
                :
                <div className='loading-page-add-stocks'>
                    <div className='column-add-stocks'>
                        <ReactLoading type={'spin'} color={'#224255'} height={150} width={150} />
                        <p>Carregando...</p>
                    </div>
                </div>
            }
        </main>
    );
}
export default AddStocks;