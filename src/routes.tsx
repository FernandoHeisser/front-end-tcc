import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Apriori from './pages/Apriori';
import AprioriStock from './pages/AprioriStock';
import AprioriResult from './pages/AprioriResult';
import AprioriStockResult from './pages/AprioriStockResult';

const AppRoutes = () => {
    return (
        <BrowserRouter >
            <Routes>
                <Route element={<Login />} path="/"/>
                <Route element={<Home />} path="/home"/>
                <Route element={<Apriori />} path="/apriori"/>
                <Route element={<AprioriStock />} path="/apriori-stock"/>
                <Route element={<AprioriResult />} path="/apriori-result"/>
                <Route element={<AprioriStockResult />} path="/apriori-stock-result"/>
            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;