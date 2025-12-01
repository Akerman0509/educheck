
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/PageLayout'; 
import Home from './pages/Home';
import Student from './pages/Student';
import AddPage from './pages/School/AddPage';
import ListPage from './pages/School/ListPage';

function App() {
  return (
    <Router>
      <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<Student />} />
            <Route path="/School/AddPage" element={<AddPage />} />
            <Route path="/School" element={<ListPage />} />
          </Routes>
      </Layout>
    </Router>
  );
}

export default App
