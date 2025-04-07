import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Callback from './Callback';
import Videos from './Videos';
import Dashboard from './components/Dashboard';
import PlaylistPage from './components/PlaylistPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/oauth2callback" element={<Callback />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/playlist/:playlistId" element={<PlaylistPage />} />
            </Routes>
        </Router>
    );
}

export default App;
