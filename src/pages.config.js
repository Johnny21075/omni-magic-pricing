import Pricing from './pages/Pricing';
import GratuityPage from './pages/GratuityPage';
import EventSelection from './pages/EventSelection';
import Home from './pages/Home';
import DepositPaymentPage from './pages/DepositPaymentPage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Pricing": Pricing,
    "GratuityPage": GratuityPage,
    "EventSelection": EventSelection,
    "Home": Home,
    "DepositPaymentPage": DepositPaymentPage,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};