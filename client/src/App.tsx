import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { GuardsList } from './pages/Guards/GuardsList';
import { GuardView } from './pages/Guards/GuardView';
import { GuardAdd } from './pages/Guards/GuardAdd';
import { GuardEdit } from './pages/Guards/GuardEdit';
import { GuardAssign } from './pages/Guards/GuardAssign';
import { GuardAssignmentEdit } from './pages/Guards/GuardAssignmentEdit';
import { AttendanceList } from './pages/Attendance/AttendanceList';
import { FirearmsList } from './pages/Firearms/FirearmsList';
import { FirearmAdd } from './pages/Firearms/FirearmAdd';
import { FirearmEdit } from './pages/Firearms/FirearmEdit';
import { IssuanceList } from './pages/FirearmIssuance/IssuanceList';
import { IssueFirearm } from './pages/FirearmIssuance/IssueFirearm';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { authService } from './services/authService';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = authService.isAuthenticated();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = authService.getCurrentUser();
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="guards" element={<GuardsList />} />
          <Route path="guards/add" element={<GuardAdd />} />
          <Route path="guards/:id" element={<GuardView />} />
          <Route path="guards/:id/edit" element={<GuardEdit />} />
          <Route path="guards/:id/assign" element={<GuardAssign />} />
          <Route path="guards/:guardId/assignments/:id/edit" element={<GuardAssignmentEdit />} />
          <Route path="attendance" element={<AttendanceList />} />
          <Route
            path="firearms"
            element={
              <AdminRoute>
                <FirearmsList />
              </AdminRoute>
            }
          />
          <Route
            path="firearms/add"
            element={
              <AdminRoute>
                <FirearmAdd />
              </AdminRoute>
            }
          />
          <Route
            path="firearms/:id/edit"
            element={
              <AdminRoute>
                <FirearmEdit />
              </AdminRoute>
            }
          />
          <Route
            path="issuance"
            element={
              <AdminRoute>
                <IssuanceList />
              </AdminRoute>
            }
          />
          <Route
            path="issuance/issue"
            element={
              <AdminRoute>
                <IssueFirearm />
              </AdminRoute>
            }
          />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
