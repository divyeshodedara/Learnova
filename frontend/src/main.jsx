import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PayPalScriptProvider options={paypalOptions}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </PayPalScriptProvider>
  </StrictMode>,
)
