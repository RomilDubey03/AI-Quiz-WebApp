import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import Header from './components/layout/Header';

// Import pages here (we'll create these next)
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/quiz/CreateQuiz';
import JoinQuiz from './pages/quiz/JoinQuiz';
import QuizSession from './pages/quiz/QuizSession';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-quiz" element={<CreateQuiz />} />
              <Route path="/join" element={<JoinQuiz />} />
              <Route path="/session/:sessionId" element={<QuizSession />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
