
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BlockchainProvider } from './context/BlockchainContext';
import Layout from './components/ui/PageLayout'; 
import Home from './pages/Home';
import Student from './pages/Student';
import AddPage from './pages/School/AddPage';
import ListPage from './pages/School/ListPage';
import Admin from './pages/Admin';  

function App() {
  return (
    <BlockchainProvider>
      <Router>
        <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/student" element={<Student />} />
              <Route path="/School/AddPage" element={<AddPage />} />
              <Route path="/School" element={<ListPage />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
        </Layout>
      </Router>
    </BlockchainProvider>
  );
}

export default App
