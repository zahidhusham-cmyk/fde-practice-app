import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { TicketDetail } from "./pages/TicketDetail";
import { TicketList } from "./pages/TicketList";

export function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="topbar">
          <NavLink to="/" className="brand">
            <span className="brand-mark">N</span>
            Northstar Desk
          </NavLink>
          <span className="topbar-meta">IT Support · Internal</span>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<TicketList />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
