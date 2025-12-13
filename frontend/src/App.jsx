import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BlockchainProvider } from "./context/BlockchainContext";
import Layout from "./components/ui/PageLayout";
import Home from "./pages/Home";
import Student from "./pages/Student";
import AddPage from "./pages/School/AddPage";
import ListPage from "./pages/School/ListPage";
import Admin from "./pages/Admin";
import RedirectOnRefresh from "./components/RedirectOnRefresh";
function App() {
    return (
        <BlockchainProvider>
            <Router>
                <Layout>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/admin" element={<Admin />} />

                        {/* Protected on refresh */}
                        <Route element={<RedirectOnRefresh />}>
                            <Route path="/student" element={<Student />} />
                            <Route path="/School" element={<ListPage />} />
                            <Route
                                path="/School/AddPage"
                                element={<AddPage />}
                            />
                        </Route>
                    </Routes>
                </Layout>
            </Router>
        </BlockchainProvider>
    );
}

export default App;
