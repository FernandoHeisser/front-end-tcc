import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ReactLoading from 'react-loading';
import { useLocation, useNavigate } from 'react-router';
import { ImCheckboxChecked } from 'react-icons/im';
import './aprioriStock.css';
import Stock from '../../models/Stock';
import api from '../../services/api';

interface CustomizedState {
    stock: Stock
}

const AprioriStock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sideMenuFlag, setSideMenuFlag] = useState(false);
    const [loadingFlag, setLoadingFlag] = useState(false);
    const [loadingFlag2, setLoadingFlag2] = useState(true);
    const [responseFlag, setResponseFlag] = useState(false);
    const [stock, setStock] = useState<Stock>();
    const [startDate, setStartDate] = useState<string>(getToday());
    const [endDate, setEndDate] = useState<string>(getToday());
    const [minSupport, setMinSupport] = useState("null");
    const [minConfidence, setMinConfidence] = useState("null");
    const [minLift, setMinLift] = useState("null");
    const [firstCondition, setFirstCondition] = useState("Abertura");
    const [secondCondition, setSecondCondition] = useState("Fechamento");
    const [stockCondition, setStockCondition] = useState("<");
    const [interval, setInterval] = useState('1d');

    function handleLogout(){
        if (window.confirm("Você realmente quer sair?")) {
            localStorage.clear();
            navigate('/');
        } else {
            setSideMenuFlag(false);
        }
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

    function handleStockCondition(event: ChangeEvent<HTMLSelectElement>){
        const stockCondition = event.target.value;
        setStockCondition(stockCondition);
    }

    function handleInterval(event: ChangeEvent<HTMLSelectElement>){
        const interval = event.target.value;
        setInterval(interval);
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const request = {
            'stock': stock,
            'startDate': startDate,
            'endDate': endDate,
            'minSupport': minSupport,
            'minConfidence': minConfidence,
            'minLift': minLift,
            'firstCondition': firstCondition,
            'secondCondition': secondCondition,
            'stockCondition': stockCondition,
            'interval': interval
        };

        setLoadingFlag2(false);

        try {
            console.log(request);// const response = await api.post('/apriori-stock', request);

            // navigate('/apriori-result', {
            //     state: {
            //         response: response.data,
            //         request: request
            //     }
            // });

        } catch(e) {
            setStartDate("null");
            setEndDate("null");
            setMinSupport("null");
            setMinConfidence("null");
            setMinLift("null");
            setFirstCondition("Abertura");
            setSecondCondition("Fechamento");
            setInterval('1d');

            setLoadingFlag2(true);
            alert('Período e intervalo de tempo inviável, tente com um período ou intervalo de tempo menor.');
        }
        
        setLoadingFlag2(true);
    }

    useEffect(() => {
        (async function () {

            const state = location.state as CustomizedState;  
            if(state === undefined || state === null) {
                navigate('/home');
            } else {
                setStock(state.stock);
            }

            setLoadingFlag(true);
        })();
    }, []);

    return (
        <>
            <main>
                {
                    loadingFlag ?
                        <>
                            {
                                loadingFlag2 ?
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
                                                    <p>Analise {stock?.symbol} com todas ações</p>
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
                                                    <p className='menu-apriori-item' onClick={()=>navigate('/apriori')}>Análise Apriori</p>
                                                </div>
                                            </div>
                                            <div className='main-apriori'>
                                                <div className='main-apriori-left'>
                                                    <div className='item-apriori-selected'>
                                                        <p className='item-apriori-p'>{stock?.symbol}</p>
                                                        <ImCheckboxChecked/>
                                                    </div>
                                                </div>
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
                                                                <div className='apriori-item-box-select'>
                                                                    <select onChange={handleStockCondition}>
                                                                        <option value=">">Maior que</option>
                                                                        <option value="<" selected>Menor que</option>
                                                                    </select>
                                                                </div>
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
                                                                        <option value='2m'>2 Minutos</option>
                                                                        <option value='5m'>5 Minutos</option>
                                                                        <option value='15m'>15 Minutos</option>
                                                                        <option value='30m'>30 Minutos</option>
                                                                        <option value='60m'>60 Minutos</option>
                                                                        <option value='90m'>90 Minutos</option>
                                                                        <option value='1h'>1 Hora</option>
                                                                        <option value='1d' selected>1 Dia</option>
                                                                        <option value='5d'>5 Dias</option>
                                                                        <option value='1wk'>1 Semana</option>
                                                                        <option value='1mo'>1 Mês</option>
                                                                        <option value='3mo'>3 Meses</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className='column-1-apriori-right'>
                                                                <div className='support'>
                                                                    <p>Suporte Mínimo:</p>
                                                                    <input className='input-number' type="number" placeholder='0,1' step="0.1" onChange={handleMinSupport}/>
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
                                            <p className='column-apriori-p'>Coletando e analisando...</p>
                                        </div>
                                    </div>
                            }
                        </>
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
export default AprioriStock;