// frontend/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Home     from "./pages/Home";
import History  from "./pages/History";
import Library  from "./pages/Library";
import Search_  from "./pages/Search";
import Quiz     from "./pages/Quiz";
import NotFound from "./pages/NotFound";
import Loader   from "./components/ui/Loader";

// Protected route — waits for auth token to be ready
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { isReady, syncing }     = useAuthContext();

  // Clerk still loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "var(--cream)" }}>
        <Loader text="Loading..." />
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // Signed in but still syncing user to DB / setting token
  if (syncing || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "var(--cream)" }}>
        <Loader text="Setting up your account..." />
      </div>
    );
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="history"
              element={
                <ProtectedRoute><History /></ProtectedRoute>
              }
            />
            <Route
              path="library"
              element={
                <ProtectedRoute><Library /></ProtectedRoute>
              }
            />
            <Route
              path="search"
              element={
                <ProtectedRoute><Search_ /></ProtectedRoute>
              }
            />
            <Route
              path="quiz"
              element={
                <ProtectedRoute><Quiz /></ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;