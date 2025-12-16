import { Routes, Route } from 'react-router-dom';
import WishlistApp from './components/WishlistApp'
import WishlistViewer from './components/WishlistViewer';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<WishlistApp />} />
      <Route path="/wishlist/:uuid" element={<WishlistViewer />} />
    </Routes>
  );
}

export default App
