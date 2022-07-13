import React, { useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useNavigate } from 'react-router';
import Accordion from 'react-bootstrap/Accordion'
import Table from 'react-bootstrap/Table'
import { CgArrowLongRight } from 'react-icons/cg';
import { AiOutlineReload } from 'react-icons/ai';
import { GiSadCrab } from 'react-icons/gi';
import './aprioriResult.css';
import StockDataYahoo from '../../models/StockDataYahoo';
import YahooData from '../../models/YahooData';
import Stock from '../../models/Stock';
import AprioriAnalysis from '../../models/AprioriAnalysis';
import AprioriItem from '../../models/AprioriItem';
import AprioriStockCondition from '../../models/AprioriStockCondition';
import api from '../../services/api';

const AprioriResult = () => {
    const navigate = useNavigate();
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [loadingFlag2, setLoadingFlag2] = useState(false);
    const [items, setItems] = useState<AprioriItem[]>([]);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [stockDataYahoo, setStockDataYahoo] = useState<StockDataYahoo[]>([]);
    const [aprioriAnalysis, setAprioriAnalysis] = useState<AprioriAnalysis>();

    function getToday(){
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        if(month < 10) {
            var _month: string = '0' + month;
        } else {
            var _month: string = month.toString();
        }

        if(day < 10) {
            var _day: string = '0' + day;
        } else {
            var _day: string = day.toString();
        }
        
        return year + '-' + _month + '-' + _day;
    }

    function formateDate(date: string | undefined){
        if (date !== undefined) {
            let dataArray = date.split('-');
            dataArray = dataArray.reverse();
            return dataArray.join('/');
        }
    }

    function checkItemList(){
        if (items === undefined)
            return true;
        if (items === null)
            return true;
        if (items.length === 0)
            return true;
        return false;
    }

    async function reloadData(){
        setLoadingFlag2(true);
        let symbols: string[] = [];
        stocks.forEach(stock => {
            if (stock.symbol !== undefined) {
                symbols.push(stock.symbol);
            }
        });

        await getStockDataFromYahoo(symbols, aprioriAnalysis?.interval);
        setLoadingFlag2(false);
    }

    function handleLogout(){
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            navigate('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    function getCondition(){
        const firstCondition = aprioriAnalysis?.firstCondition;
        const secondCondition = aprioriAnalysis?.secondCondition;

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
        if(stockDataYahoo === null || stockDataYahoo === undefined)
            return false;

        const stockCondition: AprioriStockCondition = getCondition();
        const stockData = stockDataYahoo.find(s => s.symbol === symbol);
        
        if(stockData === null || stockData === undefined || stockData.content === null || stockData.content === undefined)
            return false;

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

    async function getStockDataFromYahoo(symbols: string[], interval: string | undefined){
        const request = {
            stockList: symbols,
            interval: interval === undefined ? '1d' : interval
        };
        const response = await api.post('yahoo', request);
        const _stockDataYahoo: StockDataYahoo[] = response.data;
        setStockDataYahoo(_stockDataYahoo);
    }

    useEffect(() => {
        (async function () {
            const userId = localStorage.getItem('userId');
            if(userId === undefined || userId === null) {
                navigate('/');
            }
    
            const lastAnalysis = localStorage.getItem('last-analysis');
            if(lastAnalysis === undefined || lastAnalysis === null) {
                navigate('/apriori');
            } else {
                var _items: AprioriItem[] = JSON.parse(lastAnalysis);

                setItems(_items);

                const requestApriori = localStorage.getItem('request-apriori');
                
                if(requestApriori !== undefined && requestApriori !== null) {
                    
                    const _condition: AprioriAnalysis = JSON.parse(requestApriori);
                    
                    setAprioriAnalysis(_condition);

                    const stocks: Stock[] = _condition.stocks;
                    
                    setStocks(stocks);
                    
                    let symbols: string[] = [];
                    stocks.forEach(stock => {
                        if (stock.symbol !== undefined) {
                            symbols.push(stock.symbol);
                        }
                    });

                    await getStockDataFromYahoo(symbols, _condition.interval); 
                }
            }

            setLoadingFlag(true);
        })();
    }, []);

    return (
        <main>
            {
            loadingFlag ?
                <div className='main'>
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
                            <p className='menu-apriori-result-item' onClick={()=>navigate('/home')}>Página Principal</p>
                            <p className='menu-apriori-result-item' onClick={()=>navigate('/apriori')}>Análise Apriori</p>
                        </div>
                    </div>
                    <div className='main-apriori-result'>
                        <div className='main-apriori-result-left'>
                            {checkItemList()?
                                    <div className='empty-article-list'>
                                        <div className='empty-article-list-inside'>
                                            <GiSadCrab  className='empty-article-list-icon'></GiSadCrab>
                                            <p  className='empty-article-list-p'>Nenhum resultado encontrado. Tente mudar o filtro utilizado.</p>
                                        </div>
                                    </div>
                                :
                                    <Accordion defaultActiveKey="0" >
                                    {items.map((item, index) => (
                                        <div key={index}>
                                            <Accordion.Item eventKey={index.toString()} className='accordion-item'>
                                                <Accordion.Header>
                                                    <div className='apriori-result-item-left'>
                                                        <div className='apriori-item-index'>
                                                            <span>{(index+1).toString()}</span>
                                                        </div>
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
                                                    {loadingFlag2 ? 
                                                        <div className='loading-page-apriori-result'>
                                                            <div>
                                                                <ReactLoading type={'spin'} color={'#224255'} height={75} width={75} />
                                                            </div>
                                                        </div>
                                                        :
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
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.open).toFixed(2)}</p></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.close).toFixed(2)}</p></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.high).toFixed(2)}</p></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.low).toFixed(2)}</p></td>
                                                                    <td className='td'><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.volume)}</p></td>
                                                                </tr>
                                                            ))}
                                                            {item.items_add.map(symbol => (
                                                                <tr key={symbol}>
                                                                    <td><strong className={checkCondition(symbol) ? 'green-symbol' : 'red-symbol'}>{symbol}</strong></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.open).toFixed(2)}</p></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.close).toFixed(2)}</p></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.high).toFixed(2)}</p></td>
                                                                    <td><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.low).toFixed(2)}</p></td>
                                                                    <td className='td'><p>{Number(stockDataYahoo?.find(s=>s.symbol===symbol)?.content?.today.volume)}</p></td>
                                                                </tr>
                                                            ))}
                                                            </tbody>
                                                        </Table>
                                                    }
                                                    <div className='side-table'>
                                                        <div className='side-table-left'>
                                                            <div className='side-table-left-top'>
                                                                <AiOutlineReload className='reload-button' onClick={reloadData}/>
                                                            </div>
                                                            <div className='side-table-left-bottom'>

                                                            </div>
                                                        </div>
                                                        <div className='side-table-right'>
                                                            <p>Valores atuais das ações analisadas.</p>
                                                            <p><span className='red-symbol'>Vermelho</span> - A condição analisada não está se satisfazendo atualmente.</p>
                                                            <p><span className='green-symbol'>Verde</span> - A condição analisada está se satisfazendo atualmente.</p>
                                                        </div>
                                                    </div>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </div>
                                    ))}
                                    </Accordion>
                            }
                        </div>
                        <div className='main-apriori-result-right'>
                            <div className='main-apriori-result-right-top'>
                                <p className='main-apriori-result-right-top-title'>Análise realizada</p>
                                <div>
                                    <p className='main-apriori-result-right-top-interval-box-title'>Periodo de tempo:</p>
                                    <div className='main-apriori-result-right-top-time-box'>
                                        <p>{formateDate(aprioriAnalysis?.startDate)}</p>
                                        <p className='main-apriori-result-right-top-time-box-middle'>até</p>
                                        <p>{aprioriAnalysis?.endDate === undefined?formateDate(getToday()):formateDate(aprioriAnalysis?.endDate)}</p>
                                    </div>
                                </div>
                                <div className='main-apriori-result-right-top-interval-box'>
                                    <p className='main-apriori-result-right-top-interval-box-title'>Intervalo:</p>
                                    <p>{aprioriAnalysis?.interval}</p>
                                </div>
                                <div className='main-apriori-result-right-top-filter-box'>
                                    <div className='main-apriori-result-right-top-time-box'>
                                        <p className='main-apriori-result-right-top-interval-box-title'>Suporte mínimo:</p>
                                        <p>{aprioriAnalysis?.minSupport.toString() === 'null'?'Nenhum':aprioriAnalysis?.minSupport}</p>
                                    </div>
                                    <div className='main-apriori-result-right-top-time-box'>
                                        <p className='main-apriori-result-right-top-interval-box-title'>Confiança mínima:</p>
                                        <p>{aprioriAnalysis?.minConfidence.toString() === 'null'?'Nenhum':aprioriAnalysis?.minConfidence}</p>
                                    </div>
                                    <div className='main-apriori-result-right-top-time-box'>
                                        <p className='main-apriori-result-right-top-interval-box-title'>Lift mínimo:</p>
                                        <p>{aprioriAnalysis?.minLift.toString() === 'null'?'Nenhum':aprioriAnalysis?.minLift}</p>
                                    </div>
                                </div>
                            </div>
                            <div className='main-apriori-result-right-bottom'>
                                {aprioriAnalysis?.stocks.map(stock=>(
                                    <div className='main-apriori-result-right-bottom-card'>
                                        <div>
                                            <p className='main-apriori-result-right-top-interval-box-title'>{stock.symbol}</p>
                                        </div>
                                        <div className='main-apriori-result-right-bottom-card-box'>
                                            <p>{aprioriAnalysis.firstCondition}</p>
                                            <p className='main-apriori-result-right-top-time-box-middle'>{stock.condition}</p>
                                            <p>{aprioriAnalysis.secondCondition}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
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