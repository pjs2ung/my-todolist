import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthPage } from '../pages/auth-page/AuthPage'
import { ProfilePage } from '../pages/profile-page/ProfilePage'
import { TodoListPage } from '../pages/todo-list-page/TodoListPage'
import { TodoFormPage } from '../pages/todo-form-page/TodoFormPage'
import { useAuthStore } from '../entities/session/model/authStore'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/todos" replace /> : <Outlet />
}

const router = createBrowserRouter([
  { element: <PublicOnlyRoute />, children: [{ path: '/', element: <AuthPage /> }] },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/todos', element: <TodoListPage /> },
      { path: '/todos/new', element: <TodoFormPage /> },
      { path: '/todos/:id/edit', element: <TodoFormPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
