import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Apriori from './pages/Apriori';
import AprioriResult from './pages/AprioriResult';

const AppRoutes = () => {
    return (
        <BrowserRouter >
            <Routes>
                <Route element={<Login />} path="/"/>
                <Route element={<Home />} path="/home"/>
                <Route element={<Apriori />} path="/apriori"/>
                <Route element={<AprioriResult />} path="/apriori-result"/>
            </Routes>
        </BrowserRouter>
    );
}
export default AppRoutes;