import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderProfile from "./pages/ProviderProfile";
import ProviderServices from "./pages/ProviderServices";
import ProviderAvailability from "./pages/ProviderAvailability";
import SearchProviders from "./pages/SearchProviders";
import BookingPage from "./pages/BookingPage";
import AppointmentHistory from "./pages/AppointmentHistory";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/provider/profile" element={<ProviderProfile />} />
      <Route path="/provider/services" element={<ProviderServices providerId="YOUR-PROVIDER-ID" />} />
      <Route path="/provider/availability" element={<ProviderAvailability providerId="YOUR-PROVIDER-ID" />} />
      <Route path="/search" element={<SearchProviders />} />
      <Route path="/book/:providerId" element={<BookingPage />} />
      <Route path="/appointments" element={<AppointmentHistory />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;