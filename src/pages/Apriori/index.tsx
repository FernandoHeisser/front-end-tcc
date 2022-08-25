import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useNavigate } from 'react-router';
import { ImCheckboxChecked, ImCheckboxUnchecked } from 'react-icons/im';
import './apriori.css';
import Stock from '../../models/Stock';
import api from '../../services/api';
import AprioriStockResult from '../../models/AprioriStockResult';

const Apriori = () => {
    const navigate = useNavigate();
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [loadingFlag2, setLoadingFlag2] = useState(true);
    const [responseFlag, setResponseFlag] = useState(false);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedStock, setSelectedStock] = useState<string>();
    const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
    const [startDate, setStartDate] = useState<string>(getToday());
    const [endDate, setEndDate] = useState<string>(getToday());
    const [minSupport, setMinSupport] = useState("0.2");
    const [minConfidence, setMinConfidence] = useState("null");
    const [minLift, setMinLift] = useState("null");
    const [firstCondition, setFirstCondition] = useState("Abertura");
    const [secondCondition, setSecondCondition] = useState("Fechamento");
    const [interval, setInterval] = useState('1d');
    const [selectAllFlag, setSelectAllFlag] = useState(false);

    function selectAll() {
        setSelectAllFlag(!selectAllFlag);

        selectedStocks.map(stock => stock.checked = !selectAllFlag);
        setSelectedStocks(selectedStocks);
    }

    function addStock() {
        let _selectedStocks = selectedStocks;
        let symbols = selectedStocks.map(stock => stock.symbol);
        if(!symbols.includes(selectedStock) && selectedStock !== '')
        _selectedStocks.push(stocks.find(stock => stock.symbol === selectedStock)!);
        setSelectedStocks(_selectedStocks);
        setSelectedStock('');
    }

    function handleSelected(event: ChangeEvent<HTMLSelectElement>){
        const selectedStock = (event.target.value);
        setSelectedStock(selectedStock);
    }

    function handleLogout(){
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            navigate('/');
        } else {
            setSideMenuFlag(false);
        }
    }

    function handleStock(stock: Stock){
        var _stocks: Stock[] = [];
        stocks.forEach(s => {
            var _stock = s;
            if(_stock.symbol === stock.symbol) {
                _stock.checked = !_stock.checked;
            }
            _stock.condition = '>';
            _stocks.push(_stock);
        });
        setStocks(_stocks);
    }

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

    function handleStartDate(event: ChangeEvent<HTMLInputElement>){
        const startDate = event.target.value;
        setStartDate(startDate);
    }
    
    function handleEndDate(event: ChangeEvent<HTMLInputElement>){
        const endDate = event.target.value;
        setEndDate(endDate);
    }
    
    function handleMinSupport(event: ChangeEvent<HTMLInputElement>){
        const minSupport = event.target.value;
        setMinSupport(minSupport);
    }
    
    function handleMinConfidence(event: ChangeEvent<HTMLInputElement>){
        const minConfidence = event.target.value;
        setMinConfidence(minConfidence);
    }
    
    function handleMinLift(event: ChangeEvent<HTMLInputElement>){
        const minLift = event.target.value;
        setMinLift(minLift);
    }
    
    function handleFirstCondition(event: ChangeEvent<HTMLSelectElement>){
        const firstCondition = event.target.value;
        setFirstCondition(firstCondition);
    }
    
    function handleSecondCondition(event: ChangeEvent<HTMLSelectElement>){
        const secondCondition = event.target.value;
        setSecondCondition(secondCondition);
    }

    function handleStockCondition(event: ChangeEvent<HTMLSelectElement>, symbol: string | undefined){
        const stockCondition = event.target.value;
        var _stocks: Stock[] = [];
        stocks.forEach(stock => {
            if(stock.symbol === symbol) {
               var _stock = stock;
               _stock.condition = stockCondition; 
               _stocks.push(_stock);
            } else {
                _stocks.push(stock);
            }
        });
        setStocks(_stocks);
    }

    function handleInterval(event: ChangeEvent<HTMLSelectElement>){
        const interval = event.target.value;
        setInterval(interval);
    }

    function delay(time: number) {
        time = time * 1000;
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        var _stocks: Stock[] = [];

        stocks.forEach(stock => {
            if(stock.checked === true){
                _stocks.push(stock);
            }
        });

        if(_stocks.length < 2){
            setResponseFlag(true);
            return;
        }

        const request = {
            'stocks': _stocks,
            'startDate': startDate,
            'endDate': endDate,
            'minSupport': minSupport,
            'minConfidence': minConfidence,
            'minLift': minLift,
            'firstCondition': firstCondition,
            'secondCondition': secondCondition,
            'interval': interval,
            'processType': 1
        };

        try {
            const response = await api.post('/apriori/instructions', request);
            var instructionId = response.data;
        } catch {
            alert('Erro na criação da análise, tente novamente.');
        }
        try {
            setLoadingFlag2(false);

            var analysisResponse;
            var i = 0;
            while (i <= 10) {
                await delay(30)
                analysisResponse = await api.get(`/apriori/analysis/${instructionId}`);
                if (analysisResponse.data !== null) {
                    break;
                }
                i++;
            }
            const aprioriStockResult: AprioriStockResult = analysisResponse?.data;

            if (aprioriStockResult.status == 200) {
                navigate('/apriori-result', {
                    state: {
                        response: aprioriStockResult.data,
                        request: request
                    }
                });
            } else {
                alert('Erro na análise, tente novamente.');    
            }
        } catch(e) {
            setLoadingFlag2(true);
            alert('Erro na análise, tente novamente.');
        }
        
        setLoadingFlag2(true);
    }

    useEffect(() => {
        (async function () {
            const userId = localStorage.getItem('userId');
            if(userId === undefined || userId === null) {
                navigate('/');
            }

            var _stocks: Stock[] = JSON.parse(localStorage.getItem('stocks')!);

            _stocks.map(stock => {
                stock.checked = false;
                stock.condition = ">";
                return stock;
            });

            setStocks(_stocks);

            setLoadingFlag(true);
        })();
    }, []);

    return (
        <>
            <main>
                {
                    loadingFlag ?
                        <form className='main' onSubmit={handleSubmit}>
                            <div className='content-apriori'>
                                <div className='top-bar-apriori'>
                                    <div className='top-bar-apriori-left'>
                                        <div className="menu-button" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                            <div className="bar"></div>
                                            <div className="bar"></div>
                                            <div className="bar"></div>
                                        </div>
                                    </div>
                                    <div className='top-bar-apriori-center'>
                                        <p>Análise de Ações com Algoritmo Apriori</p>
                                    </div>
                                    <div className='top-bar-apriori-right'>
                                    </div>
                                </div>
                                <div className={sideMenuFlag?'side-menu-apriori':'side-menu-apriori-hidden'}>
                                    <div className="menu-button-apriori" onClick={()=>setSideMenuFlag(!sideMenuFlag)}>
                                        <div className="bar-white-apriori"></div>
                                        <div className="bar-white-apriori"></div>
                                        <div className="bar-white-apriori"></div>
                                    </div>
                                    <div className='div-logout-apriori'>
                                        <p className='menu-apriori-item' onClick={handleLogout}>Sair</p>
                                    </div>
                                    <div className='menu-apriori'>
                                        <p className='menu-apriori-item' onClick={()=>navigate('/home')}>Página Principal</p>
                                    </div>
                                </div>
                                <div className='main-apriori'>
                                    <div className='main-apriori-left'>
                                        <div className='main-apriori-add-stock'>
                                            <select name="stocks" id="stocks" value={selectedStock} onChange={handleSelected}>
                                                <option value="0">Selecione uma ação</option>
                                                {stocks.map(stock => (
                                                    <option 
                                                        title={stock.symbol + ' - ' + stock.company}
                                                        className='stock-option'
                                                        key={stock._id}
                                                        value={stock.symbol}>{stock.symbol + ' - ' + stock.company}
                                                    </option>
                                                ))}
                                            </select>
                                            <button type='button' onClick={addStock}>Adicionar</button>
                                        </div>
                                        {selectedStocks.length > 1 ?
                                            <div onClick={selectAll}
                                                className={selectAllFlag ? 'item-apriori-selected' : 'item-apriori'}>
                                                    <p className='item-apriori-p'>Selecionar tudo</p>
                                                    {selectAllFlag ?
                                                        <ImCheckboxChecked/>
                                                        :
                                                        <ImCheckboxUnchecked/>
                                                    }
                                            </div>
                                            :
                                            <></>
                                        }
                                        {selectedStocks.map(stock => (
                                            <div key={stock.symbol} onClick={() => handleStock(stock)}
                                                className={stock.checked===true ? 'item-apriori-selected' : 'item-apriori'}>
                                                    <p className='item-apriori-p'>{stock.symbol}</p>
                                                    {stock.checked ?
                                                        <ImCheckboxChecked/>
                                                        :
                                                        <ImCheckboxUnchecked/>
                                                    }
                                            </div>
                                        ))}
                                    </div>
                                    {loadingFlag2 ?
                                        <div className='main-apriori-right'>
                                            <div className='row-2-apriori'>
                                                <div className='row-2-apriori-top'>
                                                    <p>Monte a sua análise:</p>
                                                </div>
                                                <div className='row-2-apriori-bottom'>
                                                    <div className='row-2-apriori-bottom-center'>
                                                        <p>Comparar</p>
                                                    </div>
                                                    <div className='row-2-apriori-bottom-left'>
                                                        <select onChange={handleFirstCondition}>
                                                            <option value="Abertura">Abertura</option>
                                                            <option value="Fechamento">Fechamento</option>
                                                            <option value="Máxima">Máxima</option>
                                                            <option value="Mínima">Mínima</option>
                                                            <option value="Abertura (anterior)">Abertura (anterior)</option>
                                                            <option value="Fechamento (anterior)">Fechamento (anterior)</option>
                                                            <option value="Máxima (anterior)">Máxima (anterior)</option>
                                                            <option value="Mínima (anterior)">Mínima (anterior)</option>
                                                        </select>
                                                    </div>
                                                    <div className='row-2-apriori-bottom-center'>
                                                        <p>com</p>
                                                    </div>
                                                    <div className='row-2-apriori-bottom-right'>
                                                        <select onChange={handleSecondCondition}>
                                                            <option value="Abertura">Abertura</option>
                                                            <option value="Fechamento" selected>Fechamento</option>
                                                            <option value="Máxima">Máxima</option>
                                                            <option value="Mínima">Mínima</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='row-1-apriori'>
                                                {stocks.map(stock => (
                                                    stock.checked ?
                                                    <div className='apriori-item' key={stock.symbol}>
                                                        <div className='apriori-item-title'>
                                                            <p>{stock.symbol}</p>
                                                        </div>
                                                        <div className='apriori-item-box'>
                                                            <p className='apriori-item-box-p'>{firstCondition}</p>
                                                            <div className='apriori-item-box-select'>
                                                                <select onChange={e => handleStockCondition(e, stock.symbol)}>
                                                                    <option value=">">Maior que</option>
                                                                    <option value="<">Menor que</option>
                                                                </select>
                                                            </div>
                                                            <p className='apriori-item-box-p'>{secondCondition}</p>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div key={stock.symbol}></div>
                                                ))}
                                            </div>
                                            <div className='row-3-apriori'>
                                                <div className='column-1-apriori'>
                                                    <div className='column-1-apriori-left'>
                                                        <div className='apriori-start-date'>
                                                            <p>Do dia:</p>
                                                            <input className='input-date' type="date" max={getToday()} required onChange={handleStartDate}/>
                                                        </div>
                                                        <div className='apriori-end-date'>
                                                            <p>Até o dia:</p>
                                                            <input className='input-date' type="date" defaultValue={getToday()} max={getToday()} onChange={handleEndDate}/>
                                                        </div>
                                                        <div className='apriori-interval'>
                                                            <p>Intervalo:</p>
                                                            <select className='apriori-interval-select' onChange={handleInterval}>
                                                                <option value='1m'>1 Minuto</option>
                                                                <option value='5m'>5 Minutos</option>
                                                                <option value='15m'>15 Minutos</option>
                                                                <option value='30m'>30 Minutos</option>
                                                                <option value='1h'>1 Hora</option>
                                                                <option value='1d' selected>1 Dia</option>
                                                                <option value='1wk'>1 Semana</option>
                                                                <option value='1mo'>1 Mês</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className='column-1-apriori-right'>
                                                        <div className='support'>
                                                            <p>Suporte Mínimo:</p>
                                                            <input className='input-number' type="number" placeholder='0.2' step="0.1" onChange={handleMinSupport}/>
                                                        </div>
                                                        <div className='confidence'>
                                                            <p>Confiança Mínima:</p>
                                                            <input className='input-number' type="number" placeholder='0.0' step="0.1" onChange={handleMinConfidence}/>
                                                        </div>
                                                        <div className='lift'>
                                                            <p>Lift Mínimo:</p>
                                                            <input className='input-number' type="number" placeholder='0.0' step="0.1" onChange={handleMinLift}/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='column-2-apriori'>
                                                    <button className='button-apriori'>Analisar</button>
                                                    <button className='button-apriori' type='reset'>Limpar</button>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div className='loading-page-apriori'>
                                            <div className='row-apriori'>
                                                <ReactLoading type={'spin'} color={'#224255'} height={150} width={150} />
                                                <div>
                                                    <p className='column-apriori-p'>Enfileirando...</p>
                                                    <p className='column-apriori-p'>Coletando...</p>
                                                    <p className='column-apriori-p'>Analisando...</p>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className='footer'>
                                <div className='footer-right'>Fernando Heisser</div>
                                <div className='footer-center'>Sistema de Apoio para Análise de Ações da Bolsa de Valores</div>
                                <div className='footer-left'>2022</div>
                            </div>
                        </form>
                        :
                        <div className='loading-page-apriori'>
                            <div className='column-apriori'>
                                <ReactLoading type={'spin'} color={'#224255'} height={150} width={150} />
                                <p className='column-apriori-p'>Buscando os dados na web...</p>
                            </div>
                        </div>
                }
            </main>
            {responseFlag ?
                <div className='pop-up-background'>
                    <div className='pop-up-add-stocks'>
                        <p>Adicione pelo menos 2 ações para realizar a análise.</p>
                        <button type='button' className='login' onClick={()=>{setResponseFlag(!responseFlag)}}>Ok</button>
                    </div>
                </div>
            :
                <></>
            }
        </>
    );
}
export default Apriori;