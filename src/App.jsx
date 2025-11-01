import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import CityDetail from './components/CityDetail/CityDetail';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/city/:cityName" element={<CityDetail />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
