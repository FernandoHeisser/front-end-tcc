import React, { ChangeEvent, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useHistory } from 'react-router';
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
    sources?: Source[]
}

interface Source {
    _id: string,
    value: string,
    checked?: boolean
}

interface UserStock {
    stockDataYahoo: StockDataYahoo,
    stockCurrentData: StockData,
    stockNews: {
        size: number,
        content: StockNews[]
    },
    tags?: string,
    sources: Sources,
    googleNews: GoogleNews[]
}

interface Item {
    symbol: string,
    selected: boolean
}

interface StockDataYahoo {
    symbol: string,
    content: {
        open: number,
        high: number,
        low: number,
        close: number,
        adjClose: number,
        volume: number,
        datetime: string
    }
}

interface StockData {
    _id: string,
    company: string,
    symbol: string,
    close: number,
    high: number,
    low: number,
    volume: number,
    variation: number,
    date: string
}

interface StockNews {
    _id: string,
    symbol: string,
    company: string,
    articleUrl: string,
    subject: string,
    title: string,
    subtitle: string,
    date: string,
    imageUrl: string,
    articleContent: string
}

interface Sources {
    size: number,
    content: Source[]
}

interface Source {
    _id: string,
    value: string,
    checked?: boolean
}

interface GoogleNews {
    _id: string,
    source: {
        id: string,
        name: string,
    },
    author: string,
    title: string,
    description: string,
    url: string,
    urlToImage: string,
    publishedAt: string,
    content: string
}

const Home = () => {
    const history = useHistory();
    const [session, setSession] = useState<Session>();
    const [haveChanges, setHaveChanges] = useState(true);
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [firstTimeFlag, setFirstTimeFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [loadingFlag2, setLoadingFlag2] = useState(true);
    const [currentUser, setCurrentUser] = useState<User>();
    const [currentTags, setCurrentTags] = useState<string | undefined>('');
    const [userId, setUserId] = useState('');
    const [tagsFlag, setTagsFlag] = useState(false);
    const [sourcesFlag, setSourcesFlag] = useState(false);
    const [responseFlag, setResponseFlag] = useState(false);
    const [items, setItems] = useState<Item[]>();
    const [changesCounter, setChangesCounter] = useState(0);
    const [userStocks, setUserStocks] = useState<UserStock[]>([]);
    const [currentUserStock, setCurrentUserStock] = useState<UserStock>();

    async function submitTags() {
        setLoadingFlag2(true);
        setTagsFlag(false);
        let stocks = currentUser?.stocks;

        stocks?.forEach(stock => {
            if (stock.symbol === currentUserStock?.stockCurrentData?.symbol) {
                if (currentTags === '') {
                    stock.tags = undefined;
                } else {
                    stock.tags = currentTags;
                }
            }
        });

        const user: User = {
            _id: currentUser?._id,
            stocks: stocks
        };

        const userTags = user.stocks?.find(stock => stock.symbol === currentUserStock?.stockCurrentData?.symbol)?.tags;
        const userSources = user.stocks?.find(stock => stock.symbol === currentUserStock?.stockCurrentData?.symbol)?.sources;

        let listKeywords = userTags?.split(', ');
        listKeywords?.map(keyword => keyword.trim());

        const search = {
            keywords: listKeywords,
            sources: userSources
        };

        const newsResponse = await api.post('/google-news', search);
        const googleNews: GoogleNews[] = newsResponse.data;

        let _currentUserStock = currentUserStock;
        if (_currentUserStock !== undefined) {
            if (currentTags === '') {
                setCurrentTags(undefined)
                _currentUserStock.tags = undefined;
            } else {
                _currentUserStock.tags = currentTags;
            }
            _currentUserStock.googleNews = googleNews;
            setCurrentUserStock(_currentUserStock);
            let _userStocks = [];
            userStocks.forEach(userStock => {
                if (userStock.stockCurrentData?._id !== _currentUserStock?.stockCurrentData?._id) {
                    _userStocks.push(userStock);
                }
            });
            _userStocks.push(_currentUserStock);
            setUserStocks(_userStocks);
        }

        await api.put('/users', user);
        setChangesCounter(changesCounter + 1)
        setLoadingFlag2(false);
    }

    async function submitSources() {
        await api.put('/users', currentUser);
        setChangesCounter(changesCounter + 1)
        setResponseFlag(true);
    }

    function handleTags(event: ChangeEvent<HTMLInputElement>) {
        const _tags = event.target.value;
        setCurrentTags(_tags);
    }

    async function handleSources(event: ChangeEvent<HTMLInputElement>) {
        setHaveChanges(true);
        setLoadingFlag2(true);
        const value = event.target.id;
        let _currentUserStock = currentUserStock;
        let user = currentUser;

        if (_currentUserStock == null || user == null)
            return;

        _currentUserStock?.sources.content.map(source => {
            if (source._id === value) {
                if (source.checked)
                    source.checked = false;
                else
                    source.checked = true;
            }
            return source;
        });

        let sources: Source[] = [];

        _currentUserStock?.sources.content.forEach(source => {
            if (source.checked)
                sources.push(source);
        });

        user?.stocks?.map(stock => {
            if (stock.symbol === currentUserStock?.stockCurrentData?.symbol) {
                stock.sources = sources;
            }
            return stock;
        });

        const userTags = user.stocks?.find(stock => stock.symbol === currentUserStock?.stockCurrentData?.symbol)?.tags;
        const userSources = user.stocks?.find(stock => stock.symbol === currentUserStock?.stockCurrentData?.symbol)?.sources;

        let listKeywords = userTags?.split(', ');
        listKeywords?.map(keyword => keyword.trim());

        const search = {
            keywords: listKeywords,
            sources: userSources
        };

        const newsResponse = await api.post('/google-news', search);
        const googleNews: GoogleNews[] = newsResponse.data;

        _currentUserStock.googleNews = googleNews;

        let _session = session;
        _session?.stocks.map(stock => {
            if (stock.stockCurrentData.symbol === currentUserStock?.stockCurrentData.symbol) {
                return _currentUserStock;
            }
        });

        setSession(_session);
        setCurrentUserStock(_currentUserStock);
        setCurrentUser(user);
        setChangesCounter(changesCounter + 1);
        setLoadingFlag2(false);
    }

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
        setTagsFlag(false);
        setSourcesFlag(false);

        let itemList = items;
        itemList?.forEach(item => {
            if (item.symbol === param.symbol) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });

        setCurrentUserStock(userStocks.find(page => page.stockCurrentData?.symbol === param.symbol));
        setItems(itemList);
        setChangesCounter(changesCounter + 1);
    }

    function setSelected(firstSymbol: string) {
        setCurrentUserStock(userStocks.find(page => page.stockCurrentData?.symbol === firstSymbol));
    }

    function formatContent(str: string) {
        if (str !== null && str !== undefined)
            str = str.split('[')[0];

        return str;
    }

    function compare(a: StockNews, b: StockNews) {
        if (Date.parse(a.date) < Date.parse(b.date)) {
            return 1;
        }
        if (Date.parse(a.date) > Date.parse(b.date)) {
            return -1;
        }
        return 0;
    }

    function handleLogout() {
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            history.push('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    async function handleUpdateData() {
        if (window.confirm("A busca por notícias pode levar algum tempo, você tem certeza?")) {
            setLoadingFlag(false);
            const userId = localStorage.getItem('userId');
            await api.get(`session/fetch/${userId}`);
            document.location.reload();
            setSideMenuFlag(false);
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

            if(userId === undefined || userId === null) {
                history.push('/');
            } else {
                setUserId(userId);
            }

            const _firstTimeFlag = localStorage.getItem('first-time-flag');
            setFirstTimeFlag(_firstTimeFlag === 'true');
            localStorage.setItem('first-time-flag', "false");

            const sessionResponse = await api.get(`/session/${userId}`);

            const _session: Session = sessionResponse.data;
            setSession(_session);

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
                .find(stock => stock.stockCurrentData.symbol === symbol);

                if (currentUserStock !== undefined){

                    const stockNews: StockNews[] = currentUserStock.stockNews.content.sort(compare);

                    const stockData: StockData = currentUserStock.stockCurrentData;

                    const stockDataYahoo: StockDataYahoo = currentUserStock.stockDataYahoo;
    
                    const responseSources = await api.get('/google-news/sources');
                    let sources: Sources = responseSources.data;
    
                    const currentStock = _session.user.stocks?.find(stock => stock.symbol === symbol);
                    
                    sources.content.map(source => {
                        if (currentStock?.sources?.find((_source: Source) => _source._id === source._id) !== undefined)
                            source.checked = true;
                        return source;
                    });
    
                    const userTags = _session.user.stocks?.find(stock => stock.symbol === symbol)?.tags;
    
                    let listKeywords = userTags?.split(', ');
                    listKeywords?.map(keyword => keyword.trim());
    
                    if ((listKeywords === undefined || listKeywords?.length === 0) && stockData !== undefined) {
                        listKeywords = [stockData.symbol, stockData.company];
                    }
    
                    if (_session.user.stocks?.find(stock => stock.symbol === item.symbol) === undefined) {
                        _session.user.stocks?.map(stock => {
                            if (stock.symbol === item.symbol) {
                                stock.tags = listKeywords?.join(", ");
                            }
                            return stock;
                        });
                    }
                    
                    const googleNews: GoogleNews[] = currentUserStock.googleNews;
                    const userStockItem: UserStock = {
                        stockDataYahoo: stockDataYahoo,
                        stockCurrentData: stockData,
                        stockNews: {
                            size: stockNews.length,
                            content: stockNews,
                        },
                        tags: userTags,
                        sources: sources,
                        googleNews: googleNews
                    };
                    
                    userStockList.push(userStockItem);
    
                    setCurrentUser(_session.user);
                    setItems(itemList);
                    setUserStocks(userStockList);
                    setSelected(firstSymbol);
                    setLoadingFlag(true);
                    setLoadingFlag2(false);
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
                                <div className="menu-button" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                    <div className="bar"></div>
                                </div>
                            </div>
                            <div className='top-bar-center'>
                                <div>
                                    <p className='top-bar-p'>{currentUserStock?.stockCurrentData?.symbol}</p>
                                </div>
                                <div>
                                    <p className='top-bar-p'>{currentUserStock?.stockCurrentData?.company}</p>
                                    <span className='top-bar-span'>Empresa</span>
                                </div>
                                <div>
                                    <p className='top-bar-p'>{currentUserStock?.stockCurrentData?.close}</p>
                                    <span className='top-bar-span'>Cotação</span>
                                </div>
                            </div>
                            <div className='top-bar-right'>
                                <div>
                                    <p className='top-bar-p'>{currentUserStock?.stockCurrentData?.high}</p>
                                    <span className='top-bar-span'>Alta</span>
                                </div>
                                <div>
                                    <p className='top-bar-p'>{currentUserStock?.stockCurrentData?.low}</p>
                                    <span className='top-bar-span'>Baixa</span>
                                </div>
                                <div>
                                    <p className='top-bar-p'>{formatDate(currentUserStock?.stockCurrentData?.date)}</p>
                                </div>
                            </div>
                        </div>
                        <div className={sideMenuFlag?'side-menu':'side-menu-hidden'}>
                            <div className="menu-button" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                <div className="bar-white"></div>
                                <div className="bar-white"></div>
                                <div className="bar-white"></div>
                            </div>
                            <div className='div-logout'>
                                <p className='menu-item' onClick={handleLogout}>Sair</p>
                            </div>
                            <div className='menu'>
                                <p className='menu-item' onClick={handleUpdateData}>Buscar notícias</p>
                                <p className='menu-item' onClick={()=>history.push('/apriori')}>Análise Apriori</p>
                                <p className='menu-item' onClick={()=>history.push('/add-stocks')}>Editar Carteira</p>
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
                                {currentUserStock?.googleNews === null || (currentUserStock?.googleNews.length === 0 && currentUserStock.stockNews.size === 0) ?
                                    <div className='empty-list-class'>
                                        <p>Nenhuma notícia encontrada para esse ativo, 
                                            <span className='empty-list-class-span' onClick={handleUpdateData}> clique aqui para buscar notícias na internet.</span>
                                        </p>
                                    </div>
                                :
                                    <>
                                        <div className='inside-left'>
                                        <div className='tags-bar'>
                                            <p className='tags-bar-p'>Palavras-chave: </p>
                                            {
                                                tagsFlag ?
                                                    <>
                                                        <input
                                                            className='tags-bar-input'
                                                            defaultValue={
                                                                (currentUserStock?.tags === undefined
                                                                    || currentUserStock?.tags === null) ?
                                                                    "Exemplo: ações, valores, notícias" :
                                                                    currentUserStock?.tags
                                                            }
                                                            onChange={handleTags}
                                                            type="text"
                                                        />
                                                        <button
                                                            type='button'
                                                            className='edit-button'
                                                            onClick={submitTags}>
                                                            Salvar
                                                        </button>
                                                    </> :
                                                    <p className='p-text'>
                                                        {
                                                            (currentUserStock?.tags === undefined
                                                                || currentUserStock?.tags === null) ?
                                                                "Adicione palavras-chave para buscar noticias relacionadas" :
                                                                currentUserStock?.tags
                                                        }
                                                    </p>
                                            }
                                            <button
                                                className={tagsFlag ? 'edit-button-selected' : 'edit-button'}
                                                onClick={() => setTagsFlag(!tagsFlag)}>
                                                Editar
                                            </button>
                                            <button
                                                className={sourcesFlag ? 'edit-button-selected' : 'edit-button'}
                                                onClick={() => setSourcesFlag(!sourcesFlag)}>
                                                Fontes
                                            </button>
                                        </div>{ loadingFlag2 ?
                                            <div className='loading-page'>
                                                <div className='column'>
                                                    <ReactLoading type={'spin'} color={'#457B9D'} height={150} width={150} />
                                                    <p>Buscando notícias na web...</p>
                                                </div>
                                            </div>
                                            :
                                            <div className='news'>
                                                {currentUserStock?.googleNews.length === 0 ?
                                                <div className='empty-list-class'>
                                                    <p>Nenhuma notícia encontrada,
                                                     edite as palavras-chave para buscar novas notícias.</p>
                                                </div>
                                                :
                                                <>
                                                    {
                                                        currentUserStock?.googleNews.map(article => (
                                                            <a className='a' target="_blank" key={article._id} href={article.url}>
                                                                <div className='article'>
                                                                    <p className='title'>{article.title}</p>
                                                                    <p>{article.description}</p>
                                                                    {article.urlToImage !== null ?
                                                                        <img src={article.urlToImage} alt={article.title} />
                                                                        :
                                                                        <></>
                                                                    }
                                                                    <p>{formatContent(article.content)}</p>
                                                                    <div className='card-footer'>
                                                                        <p className='time'>{formatDate(article.publishedAt)}</p>
                                                                        <p>{article.source.name}</p>
                                                                        <p>{article.author}</p>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))
                                                    }
                                                </>}
                                            </div>
                                        }
                                        </div>
                                        <div className='inside-right'>
                                            {sourcesFlag ?
                                                <div className='sources-box'>
                                                    <div className='sources-box-left'>
                                                        {
                                                            currentUserStock?.sources.content.map(source => (
                                                                <div className='source-item' key={source._id}>
                                                                    <input
                                                                        onChange={handleSources}
                                                                        defaultChecked={source.checked}
                                                                        type="checkbox"
                                                                        id={source._id}
                                                                        name={source.value} />
                                                                    <label htmlFor={source.value}>{source.value}</label>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                    <div className='sources-box-right'>
                                                        <button className='edit-button' onClick={submitSources}>Salvar</button>
                                                    </div>
                                                </div>
                                                :
                                                currentUserStock?.stockNews.content.map(stockNews => (
                                                    <a className='a' target="_blank" rel="noreferrer" key={stockNews._id} href={stockNews.articleUrl}>
                                                        <div className='item-article'>
                                                            <p>{stockNews.subject}</p>
                                                            <p className='title'>{stockNews.title}</p>
                                                            <div>
                                                                {stockNews.imageUrl !== null ?
                                                                    <img src={stockNews.imageUrl} alt={stockNews.title} />
                                                                    :
                                                                    <></>
                                                                }
                                                                <p>{stockNews.subtitle}</p>
                                                            </div>
                                                            <p className='time'>{formatDate(stockNews.date)}</p>
                                                        </div>
                                                    </a>
                                                ))
                                            }
                                        </div>
                                    </>}
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
                                        <button type='button' className='login' onClick={()=>{
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
                                        <button type='button' className='login' onClick={()=>{setResponseFlag(!responseFlag)}}>Ok</button>
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