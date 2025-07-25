import React, { useEffect, useState, useContext } from "react";
import { Navigate, useRoutes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Error404 from "./pages/Error404";
import Home from "./pages/Home";
import NewHome from "./pages/NewHome"; // Make sure to import NewHome
import { WalletContext } from "./components/WalletContext";

export default function Router() {
    const { isConnected } = useContext(WalletContext);
    const [newHome, setNewHome] = useState(false);

    useEffect(() => {
        // Get username from localStorage
        const isNewHome = localStorage.getItem("newHome");
        if (isNewHome == 1) {
            setNewHome(true);
        } else {
            setNewHome(false);
        }

        const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 hours
        const lastVisit = localStorage.getItem("lastVisit");

        if (lastVisit) {
            const timePassed = Date.now() - parseInt(lastVisit, 10);
            if (timePassed > SIX_HOURS) {
                localStorage.setItem("lastVisit", Date.now().toString());
                window.location.reload();
            }
        } else {
            localStorage.setItem("lastVisit", Date.now().toString());
        }
    }, []);

    const routes = useRoutes([
        {
            path: "/",
            element: <LandingPage />
        },
        {
            path: "/home",
            element: isConnected 
                ? (newHome ? <NewHome /> : <Home />)
                : <Navigate to="/" />
        },
        {
            path: '/404',
            element: <Error404 />
        },
        {
            path: '*',
            element: <Navigate to="/404" replace />
        },
    ]);

    return routes;
}