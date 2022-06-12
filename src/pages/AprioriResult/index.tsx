import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useHistory } from 'react-router';
import Accordion from 'react-bootstrap/Accordion'
import Table from 'react-bootstrap/Table'
import { CgArrowLongRight } from 'react-icons/cg';
import './aprioriResult.css';
import api from '../../services/api';

interface Item {
    items_base: string[],
    items_add: string[],
    support: number,
    confidence: number,
    lift: number,
}

interface Condition {
    firstCondition: string,
    secondCondition: string,
    stocks: Stock[]
}

interface StockCondition {
    columnName1?: string,
    columnName2?: string,
    previous?: boolean
}

interface Stock {
    symbol: string,
    checked?: boolean,
    condition?: string
}

interface StockDataYahoo {
    symbol: string,
    content: {
        yesterday: YahooData,
        today: YahooData
    }
}

interface YahooData {
    [key: string]: string | number,
    open: number,
    high: number,
    low: number,
    close: number,
    adjClose: number,
    volume: number,
    datetime: string
}

const AprioriResult = () => {
    const history = useHistory();
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockDataYahoo, setStockDataYahoo] = useState<StockDataYahoo[]>([]);
    const [condition, setCondition] = useState<Condition>();

    function handleLogout(){
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            history.push('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    function getCondition(){
        const firstCondition = condition?.firstCondition;
        const secondCondition = condition?.secondCondition;

        var column1;
        var column2;
        var previous;
        
        if(firstCondition === "Abertura (atual)"){
            column1 = 'open';
            previous = false;
        }

        if(firstCondition === "Fechamento (atual)"){
            column1 = 'close';
            previous = false;
        }

        if(firstCondition === "Alta (atual)"){
            column1 = 'high';
            previous = false;
        }

        if(firstCondition === "Baixa (atual)"){
            column1 = 'low';
            previous = false;
        }

        if(secondCondition === "Abertura (atual)"){
            column2 = 'open';
            previous = false;
        }

        if(secondCondition === "Fechamento (atual)"){
            column2 = 'close';
            previous = false;
        }

        if(secondCondition === "Alta (atual)"){
            column2 = 'high';
            previous = false;
        }

        if(secondCondition === "Baixa (atual)"){
            column2 = 'low';
            previous = false;
        }

        if(firstCondition === "Abertura (dia anterior)"){
            column1 = 'open';
            previous = true;
        }

        if(firstCondition === "Fechamento (dia anterior)"){
            column1 = 'close';
            previous = true;
        }

        if(firstCondition === "Alta (dia anterior)"){
            column1 = 'high';
            previous = true;
        }

        if(firstCondition === "Baixa (dia anterior)"){
            column1 = 'low';
            previous = true;
        }

        return {
            'previous': previous,
            'columnName1': column1,
            'columnName2': column2,
        }
    }

    function checkCondition(symbol: string){
        const stockCondition: StockCondition = getCondition();
        const stockData = stockDataYahoo.find(s => s.symbol === symbol);
        const stock = stocks.find(s => s.symbol === symbol);
        const yesterday: YahooData | undefined = stockData?.content.yesterday;
        const today: YahooData | undefined = stockData?.content.today;

        if(yesterday === undefined || today === undefined || stockCondition.columnName1 === undefined || stockCondition.columnName2 === undefined){
            return false;
        }

        if(stockCondition.previous === true){
            if(stock?.condition === '>') {
                return Number(yesterday[stockCondition.columnName1]) > Number(today[stockCondition.columnName2]);
            } else {
                return Number(yesterday[stockCondition.columnName1]) < Number(today[stockCondition.columnName2]);
            }
        } else {
            if(stock?.condition === '>') {
                return Number(today[stockCondition.columnName1]) > Number(today[stockCondition.columnName2]);
            } else {
                return Number(today[stockCondition.columnName1]) < Number(today[stockCondition.columnName2]);
            }
        }
    }

    async function getStockDataFromYahoo(symbols: string[]){
        const request = {
            stockList: symbols
        };
        const response = await api.post('stock/data/yahoo/list', request);
        const _stockDataYahoo: StockDataYahoo[] = response.data;
        setStockDataYahoo(_stockDataYahoo);
    }

    useEffect(() => {
        (async function () {
            const userId = localStorage.getItem('userId');
            const lastAnalysis = localStorage.getItem('last-analysis');

            if(userId === undefined || userId === null) {
                history.push('/');
            }
    
            if(lastAnalysis === undefined || lastAnalysis === null) {
                history.push('/apriori');
            } else {
                var _items: Item[] = JSON.parse(lastAnalysis);

                setItems(_items);

                const stocks_symbols = localStorage.getItem('stocks-symbols');
                
                if(stocks_symbols !== undefined && stocks_symbols !== null) {
                    
                    const stocks: Stock[] = JSON.parse(stocks_symbols);
                    
                    setStocks(stocks);
                    
                    var symbols: string[] = [];
                    
                    stocks.forEach(stock => {
                        symbols.push(stock.symbol);
                    });

                    await getStockDataFromYahoo(symbols);

                    const request_apriori = localStorage.getItem('request-apriori');
                
                    if(request_apriori !== undefined && request_apriori !== null) {
                        
                        const _condition: Condition = JSON.parse(request_apriori);
                        
                        setCondition(_condition);
                    }   
                }
            }

            setLoadingFlag(true);
        })();
    }, []);

    return (
        <main>
            {
            loadingFlag ?
                <div className='content-apriori-result'>
                    <div className='top-bar-apriori-result'>
                        <div className='top-bar-apriori-result-left'>
                            <div className="menu-button" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                <div className="bar"></div>
                                <div className="bar"></div>
                                <div className="bar"></div>
                            </div>
                        </div>
                        <div className='top-bar-apriori-result-center'>
                            <p>Análise de Ações com Algoritmo Apriori</p>
                        </div>
                        <div className='top-bar-apriori-result-right'>
                        </div>
                    </div>  
                    <div className={sideMenuFlag?'side-menu-apriori-result':'side-menu-apriori-result-hidden'}>
                        <div className="menu-button-apriori-result" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                            <div className="bar-white-apriori-result"></div>
                            <div className="bar-white-apriori-result"></div>
                            <div className="bar-white-apriori-result"></div>
                        </div>
                        <div className='div-logout-apriori-result'>
                            <p className='menu-apriori-result-item' onClick={handleLogout}>Sair</p>
                        </div>
                        <div className='menu-apriori-result'>
                            <p className='menu-apriori-result-item' onClick={()=>history.push('/home')}>Página Principal</p>
                            <p className='menu-apriori-result-item' onClick={()=>history.push('/apriori')}>Análise Apriori</p>
                            <p className='menu-apriori-result-item' onClick={()=>history.push('/add-stocks')}>Editar Carteira</p>
                        </div>
                    </div>
                    <div className='main-apriori-result'>
                        <Accordion defaultActiveKey="0">
                            {items.map((item, index) => (
                                <div key={index}>
                                <Accordion.Item eventKey={index.toString()}>
                                    <Accordion.Header>
                                        <div className='apriori-result-item-left'>
                                            {item.items_base.length > 0 ? 
                                                <div className='apriori-result-item-left-base'>
                                                    {item.items_base.map((i, index) => (
                                                        <div key={index}>
                                                        {index !== (item.items_base.length) - 1 ? 
                                                            <p className={checkCondition(i) ? 'green-symbol' : 'red-symbol'}>{i}, </p>
                                                            :
                                                            <p className={checkCondition(i) ? 'green-symbol' : 'red-symbol'}>{i}</p>
                                                        }
                                                        </div>
                                                    ))}
                                                </div> 
                                                : 
                                                <></>
                                            }
                                            {item.items_base.length > 0 ? <CgArrowLongRight className='arrow'/> : <></>}
                                            <div className='apriori-result-item-left-add'>
                                                {item.items_add.map((i, index) => (
                                                    <div key={index}>
                                                    {index !== (item.items_add.length) - 1 ? 
                                                        <p className={checkCondition(i) ? 'green-symbol' : 'red-symbol'}>{i}, </p>
                                                        :
                                                        <p className={checkCondition(i) ? 'green-symbol' : 'red-symbol'}>{i}</p>
                                                    }
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className='apriori-result-item-right'>
                                            <div title='A probabilidade de um movimento (alta/baixa) de uma ação dentro dos dados analisados.'>
                                                Suporte: {(item.support*100).toFixed(2).toString().replace('.', ',')}%
                                            </div>
                                            <div title='A probabilidade de um movimento de “Z”, dentro do conjunto de suporte.'>
                                                Confiança: {(item.confidence*100).toFixed(2).toString().replace('.', ',')}%
                                            </div>
                                            <div title='É uma medida de correlação que mostra o quão dependentes são os movimentos.'>
                                                Lift: {item.lift.toFixed(2).toString().replace('.', ',')}
                                            </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className='accordion-body'>
                                        <Table className='table'>
                                            <thead>
                                                <tr>
                                                    <th><span>Ação</span></th>
                                                    <th><span>Abertura</span></th>
                                                    <th><span>Cotação</span></th>
                                                    <th><span>Máxima</span></th>
                                                    <th><span>Mínima</span></th>
                                                    <th><span>Volume</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {item.items_base.map(symbol => (
                                                <tr key={symbol}>
                                                    <td><strong className={checkCondition(symbol) ? 'green-symbol' : 'red-symbol'}>{symbol}</strong></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.open).toFixed(2)}</p></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.close).toFixed(2)}</p></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.high).toFixed(2)}</p></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.low).toFixed(2)}</p></td>
                                                    <td className='td'><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.volume)}</p></td>
                                                </tr>
                                            ))}
                                            {item.items_add.map(symbol => (
                                                <tr key={symbol}>
                                                    <td><strong className={checkCondition(symbol) ? 'green-symbol' : 'red-symbol'}>{symbol}</strong></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.open).toFixed(2)}</p></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.close).toFixed(2)}</p></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.high).toFixed(2)}</p></td>
                                                    <td><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.low).toFixed(2)}</p></td>
                                                    <td className='td'><p>{Number(stockDataYahoo.find(s=>s.symbol===symbol)?.content.today.volume)}</p></td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                        <div className='side-table'>
                                            <p>Valores atuais das ações analisadas.</p>
                                            <p><span className='red-symbol'>Vermelho</span> - A condição analisada não está se satisfazendo atualmente.</p>
                                            <p><span className='green-symbol'>Verde</span> - A condição analisada está se satisfazendo atualmente.</p>
                                        </div>
                                    </Accordion.Body>
                                </Accordion.Item>
                                </div>
                            ))}
                        </Accordion>    
                    </div>
                    <div className='footer'>
                        <div className='footer-right'>Fernando Heisser</div>
                        <div className='footer-center'>Sistema de Apoio para Análise de Ações da Bolsa de Valores</div>
                        <div className='footer-left'>2022</div>
                    </div>
                </div>
                :
                <div className='loading-page-apriori-result'>
                    <div className='column-apriori-result'>
                        <ReactLoading type={'spin'} color={'#224255'} height={150} width={150} />
                        <p>Coletando e analisando...</p>
                    </div>
                </div>
            }
        </main>
    );
}
export default AprioriResult;