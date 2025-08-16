import { Outlet, useLocation } from 'react-router';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Layout() {
    const location = useLocation();


    const hideFooter = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className="main-layout min-vh-100">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}
