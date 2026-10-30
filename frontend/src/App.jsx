import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MyOrders from './pages/MyOrders'
import CourierOrders from './pages/CourierOrders'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/courier/orders" element={<CourierOrders />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App