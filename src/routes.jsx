import React, { useEffect, useState, useContext } from "react";
import { Navigate, useRoutes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Error404 from "./pages/Error404";
import Home from "./pages/Home";
import { WalletContext } from "./components/WalletContext";

export default function Router() {
    // Initialize with the value from localStorage
    const { isConnected } =
        useContext(WalletContext);

    useEffect(() => {
        const SIX_HOURS = 6 * 60 * 60 * 1000; // 6 tiếng
        const lastVisit = localStorage.getItem("lastVisit");

        if (lastVisit) {
            const timePassed = Date.now() - parseInt(lastVisit, 10);
            if (timePassed > SIX_HOURS) {
                // Cập nhật lại thời gian truy cập mới trước khi reload
                localStorage.setItem("lastVisit", Date.now().toString());
                window.location.reload();
            }
        } else {
            // Lần đầu truy cập: ghi lại thời gian
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
            element: isConnected ? <Home /> : <Navigate to="/" />
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
