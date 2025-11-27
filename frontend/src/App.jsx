
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/PageLayout'; 
import Home from './pages/Home';
import Student from './pages/Student';
import School from './pages/School';

function App() {
  return (
    <Router>
      <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/student" element={<Student />} />
            <Route path="/school" element={<School />} />
          </Routes>
      </Layout>
    </Router>
  );
}

export default App
