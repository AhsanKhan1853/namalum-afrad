import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from '../contexts/appcpntext'
import Index from '../pages/index'
import ParentDashboard from '../pages/Parentdashboard'
import MerchantDashboard from '../pages/merchantdashboard'
import Notfound from '../pages/Notfound'
import Login from '../pages/Login'
import Signup from '../pages/Signup'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App