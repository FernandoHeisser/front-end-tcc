import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Apriori from './pages/Apriori';
import AprioriResult from './pages/AprioriResult';
import AddStocks from './pages/AddStocks';

const Routes = () => {
    return (
        <BrowserRouter >
            <Route component={Login} path="/" exact />
            <Route component={Home} path="/home"/>
            <Route component={Apriori} path="/apriori"/>
            <Route component={AprioriResult} path="/apriori-result"/>
            <Route component={AddStocks} path="/add-stocks"/>
        </BrowserRouter>
    );
}
export default Routes;