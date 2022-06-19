import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useHistory } from 'react-router';
import { HiOutlineSearch } from 'react-icons/hi';
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import api from '../../services/api';
import './home.css';

interface Session {
    user: User,
    stocks: UserStock[]
}

interface User {
    _id?: string,
    stocks?: Stock[]
}

interface Stock {
    symbol: string,
    tags?: string,
}

interface UserStock {
    symbol: string,
    company: string,
    data: CurrentData,
    tags?: string
}

interface Item {
    symbol: string,
    selected: boolean
}

interface CurrentData {
    high: number,
    low: number,
    current: number,
    datetime: string
}

const Home = () => {
    const history = useHistory();
    const [haveChanges, setHaveChanges] = useState(true);
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [firstTimeFlag, setFirstTimeFlag] = useState(false);
    const [expandFlag, setExpandFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [userId, setUserId] = useState('');
    const [responseFlag, setResponseFlag] = useState(false);
    const [items, setItems] = useState<Item[]>();
    const [changesCounter, setChangesCounter] = useState(0);
    const [userStocks, setUserStocks] = useState<UserStock[]>([]);
    const [currentUserStock, setCurrentUserStock] = useState<UserStock>();

    function formatDate(str: string | undefined) {
        if (str !== undefined && str !== null && str !== '') {
            str = str.replace('T', ' ');
            str = str.split(' ').reverse().join(' ');
            let array = [];
            let timeArray = str.split(' ')[0].split(':');
            timeArray.pop();
            array.push(timeArray.join(':'));
            array.push(str.split(' ')[1].split('-').reverse().join('/'));
            let arrayString = array.join(' ');
            array = arrayString.split(' ');
            let newTime = array[0].split('-')[0];
            let newDate = newTime + ' ' + array[1];
            return newDate.split(' ').reverse().join(' ');
        }
    }

    function changeSelected(param: Item) {
        let itemList = items;
        itemList?.forEach(item => {
            if (item.symbol === param.symbol) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });

        setCurrentUserStock(userStocks.find(page => page?.symbol === param.symbol));
        setItems(itemList);
        setChangesCounter(changesCounter + 1);
    }

    function setSelected(firstSymbol: string) {
        setCurrentUserStock(userStocks.find(page => page?.symbol === firstSymbol));
    }

    function handleLogout() {
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            history.push('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    useEffect(() => {
        (async function () {
            if (!haveChanges) {
                return;
            }
            setHaveChanges(false);

            const userId = localStorage.getItem('userId');

            if (userId === undefined || userId === null) {
                history.push('/');
            } else {
                setUserId(userId);
            }

            const _firstTimeFlag = localStorage.getItem('first-time-flag');
            setFirstTimeFlag(_firstTimeFlag === 'true');
            localStorage.setItem('first-time-flag', "false");

            const sessionResponse = await api.get(`/session/${userId}`);

            const _session: Session = sessionResponse.data;

            let itemList: Item[] = [];
            if (_session.user.stocks !== undefined) {
                var firstSymbol = _session.user.stocks[0].symbol;
                _session.user.stocks.forEach(stock => {
                    const item: Item = {
                        symbol: stock.symbol,
                        selected: false
                    }
                    itemList.push(item);
                });
            }
            itemList[0].selected = true;

            let userStockList: UserStock[] = userStocks;
            itemList.forEach(async (item) => {
                const symbol = item.symbol;

                const currentUserStock: UserStock | undefined = _session.stocks
                    .find(stock => stock.symbol === symbol);

                if (currentUserStock !== undefined) {

                    const stockData: CurrentData = currentUserStock.data;

                    const userTags = _session.user.stocks?.find(stock => stock.symbol === symbol)?.tags;

                    let listKeywords = userTags?.split(', ');
                    listKeywords?.map(keyword => keyword.trim());

                    if ((listKeywords === undefined || listKeywords?.length === 0) && stockData !== undefined) {
                        listKeywords = [currentUserStock.symbol, currentUserStock.company];
                    }

                    if (_session.user.stocks?.find(stock => stock.symbol === item.symbol) === undefined) {
                        _session.user.stocks?.map(stock => {
                            if (stock.symbol === item.symbol) {
                                stock.tags = listKeywords?.join(", ");
                            }
                            return stock;
                        });
                    }

                    const userStockItem: UserStock = {
                        data: stockData,
                        tags: userTags,
                        symbol: currentUserStock.symbol,
                        company: currentUserStock.company
                    };

                    userStockList.push(userStockItem);

                    setItems(itemList);
                    setUserStocks(userStockList);
                    setSelected(firstSymbol);
                    setLoadingFlag(true);
                }
            });
        })();
    }, [changesCounter]);

    return (
        <main>
            {
                loadingFlag ?
                    <>
                        <div className='content'>
                            <div className='top-bar'>
                                <div className='top-bar-left'>
                                    <div className="menu-button" onClick={() => setSideMenuFlag(!sideMenuFlag)}>
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                    </div>
                                </div>
                                <div className='top-bar-center'>
                                    <div>
                                        <p className='top-bar-p'>{currentUserStock?.symbol}</p>
                                    </div>
                                    <div>
                                        <p className='top-bar-p'>{currentUserStock?.company}</p>
                                        <span className='top-bar-span'>Empresa</span>
                                    </div>
                                    <div>
                                        <p className='top-bar-p'>{Number(currentUserStock?.data?.current).toFixed(2).toString().replace('.', ',')}</p>
                                        <span className='top-bar-span'>Cotação</span>
                                    </div>
                                </div>
                                <div className='top-bar-right'>
                                    <div>
                                        <p className='top-bar-p'>{Number(currentUserStock?.data?.high).toFixed(2).toString().replace('.', ',')}</p>
                                        <span className='top-bar-span'>Alta</span>
                                    </div>
                                    <div>
                                        <p className='top-bar-p'>{Number(currentUserStock?.data?.low).toFixed(2).toString().replace('.', ',')}</p>
                                        <span className='top-bar-span'>Baixa</span>
                                    </div>
                                    <div>
                                        <p className='top-bar-p'>{formatDate(currentUserStock?.data?.datetime)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className={sideMenuFlag ? 'side-menu' : 'side-menu-hidden'}>
                                <div className="menu-button" onClick={() => setSideMenuFlag(!sideMenuFlag)}>
                                    <div className="bar-white"></div>
                                    <div className="bar-white"></div>
                                    <div className="bar-white"></div>
                                </div>
                                <div className='div-logout'>
                                    <p className='menu-item' onClick={handleLogout}>Sair</p>
                                </div>
                                <div className='menu'>
                                    <p className='menu-item' onClick={() => history.push('/apriori')}>Análise Apriori</p>
                                    <p className='menu-item' onClick={() => history.push('/add-stocks')}>Editar Carteira</p>
                                </div>
                            </div>
                            <div className='main'>
                                <div className='left'>
                                    {items?.map(item => (
                                        <div onClick={() => changeSelected(item)}
                                            key={item.symbol}
                                            className={item.selected ? 'item-selected' : 'item'}>
                                            <p>{item.symbol}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className='right'>
                                    <div className='home-inside-left'>
                                        <div className='search-bar'>
                                            <HiOutlineSearch className='search-icon' />
                                            <input type="search" className='search-input' />
                                        </div>
                                        <div className='articles'>
                                            <div className='main-article'>
                                                <div className='main-article-left'>
                                                    <div className='main-article-top'>
                                                        <div className='main-article-top-top'>
                                                            <a className='a' href="http://" target="_blank" rel="noopener noreferrer">
                                                                <p className='main-article-title'
                                                                title='Fortuna de Luiza Trajano está indo pro ralo junto com as ações do Magazine Luiza: empresária foi cortada da lista de bilionários da Forbes após MGLU3 despencar quase 90%'>
                                                                    Fortuna de Luiza Trajano está indo pro ralo junto com as ações do Magazine Luiza: empresária foi cortada da lista de bilionários da Forbes após MGLU3 despencar quase 90%
                                                                </p>
                                                            </a>
                                                        </div>
                                                        <div className='main-article-top-bottom'>
                                                            <p className='main-article-p'>Seu Dinheiro</p>
                                                            <p className='main-article-p'>5 horas atrás</p>
                                                        </div>
                                                    </div>
                                                        <div className='first-main-article-bottom'>
                                                            <div className='main-article-bottom-top'>
                                                                <p className='main-article-title-2'
                                                                title='Luiza Trajano, dona do Magazine Luiza (MGLU3), sai da lista de bilionários da Forbes'>
                                                                    Luiza Trajano, dona do Magazine Luiza (MGLU3), sai da lista de bilionários da Forbes
                                                                </p>
                                                            </div>
                                                            <div className='main-article-bottom-bottom'>
                                                                <p className='main-article-p'>Suno Notícias</p>
                                                                <p className='main-article-p'>3 dias atrás</p>
                                                            </div>
                                                        </div>
                                                    {[0, 1, 2, 4, 5].map(e => (
                                                        <div className={expandFlag ? 'main-article-bottom' : 'main-article-bottom-collapsed'}>
                                                            <div className='main-article-bottom-top'>
                                                                <p className='main-article-title-2'
                                                                title='Luiza Trajano, dona do Magazine Luiza (MGLU3), sai da lista de bilionários da Forbes'>
                                                                    Luiza Trajano, dona do Magazine Luiza (MGLU3), sai da lista de bilionários da Forbes
                                                                </p>
                                                            </div>
                                                            <div className='main-article-bottom-bottom'>
                                                                <p className='main-article-p'>Suno Notícias</p>
                                                                <p className='main-article-p'>3 dias atrás</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className='main-article-right'>
                                                    <a className='a' href="http://" target="_blank" rel="noopener noreferrer">
                                                        <img className='main-article-image' src="https://media.seudinheiro.com/cdn-cgi/image/fit=contain,width=640&,format=auto/uploads/2022/06/Design-sem-nome-56-628x353.png" alt="Luiza" />
                                                    </a>
                                                    <div className='dummy-div-1'>
                                                        <div></div>
                                                        {expandFlag ? 
                                                            <MdExpandLess className='expand-button' onClick={()=>setExpandFlag(!expandFlag)}/>
                                                            :
                                                            <MdExpandMore className='expand-button' onClick={()=>setExpandFlag(!expandFlag)}/>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {[0, 1, 2, 3, 4, 5].map(e => (
                                                <div className='article'>
                                                    <div className='article-left'>
                                                        <div className='article-top'>
                                                            <a className='a' href="http://" target="_blank" rel="noopener noreferrer">
                                                                <p className='article-title' 
                                                                title='Fortuna de Luiza Trajano está indo pro ralo junto com as ações do Magazine Luiza: empresária foi cortada da lista de bilionários da Forbes após MGLU3 despencar quase 90% Fortuna de Luiza Trajano está indo pro ralo junto com as ações do Magazine Luiza: empresária foi cortada da lista de bilionários da Forbes após MGLU3 despencar quase 90%'>
                                                                    Fortuna de Luiza Trajano está indo pro ralo junto com as ações do Magazine Luiza: empresária foi cortada da lista de bilionários da Forbes após MGLU3 despencar quase 90%
                                                                </p>
                                                            </a>
                                                        </div>
                                                        <div className='article-bottom'>
                                                            <p className='main-article-p'>Seu Dinheiro</p>
                                                            <p className='main-article-p'>5 horas atrás</p>
                                                        </div>
                                                    </div>
                                                    <div className='article-right'>
                                                        <img className='article-image' src="https://media.seudinheiro.com/cdn-cgi/image/fit=contain,width=640&,format=auto/uploads/2022/06/Design-sem-nome-56-628x353.png" alt="Luiza" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='home-inside-right'>

                                    </div>
                                </div>
                            </div>
                            <div className='footer'>
                                <div className='footer-right'>Fernando Heisser</div>
                                <div className='footer-center'>Sistema de Apoio para Análise de Ações da Bolsa de Valores</div>
                                <div className='footer-left'>2022</div>
                            </div>
                        </div>
                        {firstTimeFlag ?
                            <div className='pop-up-background'>
                                <div className='pop-up'>
                                    <p><strong>{userId}</strong></p>
                                    <p>Esse é o seu código identificador, anote-o para realizar logins futuros.</p>
                                    <button type='button' className='login' onClick={() => {
                                        setFirstTimeFlag(false);
                                        localStorage.setItem('first-time-flag', "false");
                                    }}>Anotado</button>
                                </div>
                            </div>
                            :
                            <></>
                        }
                        {responseFlag ?
                            <div className='pop-up-background'>
                                <div className='pop-up-add-stocks'>
                                    <p>Salvo com sucesso!</p>
                                    <button type='button' className='login' onClick={() => { setResponseFlag(!responseFlag) }}>Ok</button>
                                </div>
                            </div>
                            :
                            <></>
                        }
                    </>
                    :
                    <div className='loading-page'>
                        <div className='column'>
                            <ReactLoading type={'spin'} color={'#224255'} height={150} width={150} />
                            <p className='column-p'>Buscando os dados na web...</p>
                        </div>
                    </div>
            }
        </main>
    );
}
export default Home;