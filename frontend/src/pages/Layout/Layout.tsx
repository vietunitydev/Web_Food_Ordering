// Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from "../../components/NavBar/Navbar.tsx";
import Footer from "../../components/Footer/Footer.tsx";

const Layout: React.FC = () => {
    return (
        <div>
            <Navbar />
            <main className="main">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;