import React, { ChangeEvent, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useHistory } from 'react-router';
import { HiOutlineSearch } from 'react-icons/hi';
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import './home.css';
import StockData from '../../models/StockData';
import Stock from '../../models/Stock';
import Item from '../../models/Item';
import Session from '../../models/Session';
import api from '../../services/api';
import News from '../../models/News';
import User from '../../models/User';

const Home = () => {
    const history = useHistory();
    const [haveChanges, setHaveChanges] = useState(true);
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [firstTimeFlag, setFirstTimeFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [loadingFlag2, setLoadingFlag2] = useState(false);
    const [userId, setUserId] = useState('');
    const [responseFlag, setResponseFlag] = useState(false);
    const [items, setItems] = useState<Item[]>();
    const [changesCounter, setChangesCounter] = useState(0);
    const [userStocks, setUserStocks] = useState<Stock[]>([]);
    const [currentUserStock, setCurrentUserStock] = useState<Stock>();
    const [search, setSearch] = useState<string>();
    const [user, setUser] = useState<User>();

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

    function setExpandFlag(url: string) {
        var _currentUserStock = currentUserStock;
        _currentUserStock?.news?.mainArticles.map(mainArticle => {
            if(mainArticle.article.url == url){
                if(mainArticle.expandFlag == false || mainArticle.expandFlag == undefined){
                    mainArticle.expandFlag = true;
                } else {
                    mainArticle.expandFlag = false;
                }
            }
            return mainArticle;
        });
        console.log(_currentUserStock?.news?.mainArticles);
        setCurrentUserStock(_currentUserStock);
        setChangesCounter(changesCounter + 1);
    }

    function handleLogout() {
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            history.push('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    function handleSearch(event: ChangeEvent<HTMLInputElement>){
        let search = event.target.value;
        search = search.replaceAll(' ', '+')
        setSearch(search);

        let _currentUserStock = currentUserStock;
        if (_currentUserStock !== undefined) {
            _currentUserStock.tags = search;
            setCurrentUserStock(_currentUserStock);
        }
        setChangesCounter(changesCounter + 1);
    }

    function submitSearch(event: { charCode: number; }) {
        if (event.charCode === 13) {
            getNews(search);
        }
    }

    function submitSearch2() {        
        getNews(search);
    }

    async function getNews(tags: string | undefined) {
        setLoadingFlag2(true);
        if (tags !== undefined && tags !== null && tags !== '') {
            const response = await api.get(`news/${tags}`);
            const news: News = response.data;
            let _currentUserStock = currentUserStock;
            if (_currentUserStock !== undefined && news !== undefined) {
                _currentUserStock.news = news;
                _currentUserStock.tags = tags;
                setCurrentUserStock(_currentUserStock);
                setChangesCounter(changesCounter + 1);
                let _user = user;
                _user?.stocks.map(stock => {
                    if(stock.symbol === _currentUserStock?.symbol){
                        stock.tags = tags;
                    }
                    return stock;
                });
                setUser(_user);
                api.put('users', _user);
            }
        }
        setLoadingFlag2(false);
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

            setUser(_session.user);

            let itemList: Item[] = [];
            if (_session.user.stocks !== undefined) {
                var firstSymbol = _session.user.stocks[0].symbol;
                _session.user.stocks.forEach(stock => {
                    if(stock.symbol !== undefined){
                        const item: Item = {
                            symbol: stock.symbol,
                            selected: false
                        }
                        itemList.push(item);
                    }
                });
            }
            itemList[0].selected = true;

            let userStockList: Stock[] = userStocks;
            itemList.forEach(async (item) => {
                const symbol = item.symbol;

                const currentUserStock: Stock | undefined = _session.stocks
                    .find(stock => stock.symbol === symbol);

                if (currentUserStock !== undefined && currentUserStock.data !== undefined && currentUserStock.news !== undefined) {

                    const stockData: StockData = currentUserStock.data;

                    const stockNews: News = currentUserStock.news;

                    const userTags = _session.user.stocks?.find(stock => stock.symbol === symbol)?.tags;

                    let listKeywords = userTags?.split(', ');
                    listKeywords?.map(keyword => keyword.trim());

                    if ((listKeywords === undefined || listKeywords?.length === 0) && stockData !== undefined) {
                        if(currentUserStock.symbol !== undefined && currentUserStock.company !== undefined)
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

                    const userStockItem: Stock = {
                        news: stockNews,
                        data: stockData,
                        tags: userTags,
                        symbol: currentUserStock.symbol,
                        company: currentUserStock.company
                    };

                    userStockList.push(userStockItem);

                    setItems(itemList);
                    setUserStocks(userStockList);
                    if(firstSymbol !== undefined)
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
                                            <HiOutlineSearch className='search-icon' onClick={submitSearch2}/>
                                            <input value={currentUserStock?.tags?.replaceAll('+', ' ')} type="search" className='search-input' onChange={handleSearch} onKeyPress={submitSearch}/>
                                        </div>
                                        {loadingFlag2 ? 
                                            <div className='loading-page'>
                                                <div className='column'>
                                                    <ReactLoading type={'spin'} color={'#224255'} height={150} width={150} />
                                                    <p className='column-p'>Buscando os dados na web...</p>
                                                </div>
                                            </div>                    
                                            :
                                            <div className='articles'>
                                                {currentUserStock?.news?.mainArticles.map((mainArticle, index) => (
                                                    <div className='main-article' key={index}>
                                                        <div className='main-article-left'>
                                                            <div className='main-article-top'>
                                                                <div className='main-article-top-top'>
                                                                    <a className='a' href={mainArticle.article.url} target="_blank" rel="noopener noreferrer">
                                                                        <p className='main-article-title' title={mainArticle.article.title}>{mainArticle.article.title}</p>
                                                                    </a>
                                                                </div>
                                                                <div className='main-article-top-bottom'>
                                                                    <a className='a' href={mainArticle.article.source.url} target="_blank" rel="noopener noreferrer">
                                                                        <p className='main-article-p'>{mainArticle.article.source.title}</p>
                                                                    </a>
                                                                    <p className='main-article-p'>{mainArticle.article.time.title}</p>
                                                                </div>
                                                            </div>
                                                                <div className='first-main-article-bottom'>
                                                                    <div className='main-article-bottom-top'>
                                                                        <a className='a' href={mainArticle.firstSubArticle.url} target="_blank" rel="noopener noreferrer">
                                                                            <p className='main-article-title-2' title={mainArticle.firstSubArticle.title}>{mainArticle.firstSubArticle.title}</p>
                                                                        </a>
                                                                    </div>
                                                                    <div className='main-article-bottom-bottom'>
                                                                        <a className='a' href={mainArticle.firstSubArticle.source.url} target="_blank" rel="noopener noreferrer">
                                                                            <p className='main-article-p'>{mainArticle.firstSubArticle.source.title}</p>
                                                                        </a>
                                                                        <p className='main-article-p'>{mainArticle.firstSubArticle.time.title}</p>
                                                                    </div>
                                                                </div>
                                                            {mainArticle.subArticles.map((subArticle, index) => (
                                                                <div className={mainArticle.expandFlag == true ? 'main-article-bottom' : 'main-article-bottom-collapsed'} key={index}>
                                                                    <div className='main-article-bottom-top'>
                                                                        <a className='a' href={subArticle.url} target="_blank" rel="noopener noreferrer">
                                                                            <p className='main-article-title-2' title={subArticle.title}>{subArticle.title}</p>
                                                                        </a>
                                                                    </div>
                                                                    <div className='main-article-bottom-bottom'>
                                                                        <a className='a' href={subArticle.source.url} target="_blank" rel="noopener noreferrer">
                                                                            <p className='main-article-p'>{subArticle.source.title}</p>
                                                                        </a>
                                                                        <p className='main-article-p'>{subArticle.time.title}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className='main-article-right'>
                                                            <a className='a' href={mainArticle.article.url} target="_blank" rel="noopener noreferrer">
                                                                <img className='main-article-image' srcSet={mainArticle.article.image} />
                                                            </a>
                                                            <div className='dummy-div-1'>
                                                                <div></div>
                                                                {mainArticle.expandFlag ? 
                                                                    <MdExpandLess className='expand-button' onClick={()=>setExpandFlag(mainArticle.article.url)}/>
                                                                    :
                                                                    <MdExpandMore className='expand-button' onClick={()=>setExpandFlag(mainArticle.article.url)}/>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {currentUserStock?.news?.articles.map((article, index) => (
                                                    <div className='article' key={index}>
                                                        <div className='article-left'>
                                                            <div className='article-top'>
                                                                <a className='a' href={article.url} target="_blank" rel="noopener noreferrer">
                                                                    <p className='article-title' title={article.title}>{article.title}</p>
                                                                </a>
                                                            </div>
                                                            <div className='article-bottom'>
                                                                <a className='a' href={article.source.url} target="_blank" rel="noopener noreferrer">
                                                                    <p className='main-article-p'>{article.source.title}</p>
                                                                </a>
                                                                <p className='main-article-p'>{article.time.title}</p>
                                                            </div>
                                                        </div>
                                                        <div className='article-right'>
                                                            <img className='article-image' srcSet={article.image}/>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        }
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