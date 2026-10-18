import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import DemoProtectedRoute from '@/components/DemoProtectedRoute';
import Dashboard from "@/pages/Dashboard";
import PlaceholderPage from "@/pages/PlaceholderPage";
import AuthResponseHandler from '@/features/auth/AuthResponseHandler';

const OrderDetails = lazy(() => import('@/pages/OrderDetails'));
const Orders = lazy(() => import('@/pages/Orders'));
const Categories = lazy(() => import('@/pages/Categories'));
const Products = lazy(() => import('@/pages/Products'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const Login = lazy(() => import('@/pages/Login'));
const AccessDenied = lazy(() => import('@/pages/AccessDenied'));

function App() {
	return (
		<BrowserRouter>
			<AuthResponseHandler />
			<Routes>
				<Route
					path="login"
					element={
						<Suspense fallback={<PlaceholderPage title="Login" message="Loading demo sign-in..." />}>
							<Login />
						</Suspense>
					}
				/>
				<Route element={<DemoProtectedRoute />}>
					<Route element={<AdminLayout />}>
						<Route index element={<Navigate to="/dashboard" replace />} />
						<Route path="dashboard" element={<Dashboard />} />
						<Route
							path="products"
							element={
								<Suspense fallback={<PlaceholderPage title="Products" message="Loading products..." />}>
									<Products />
								</Suspense>
							}
						/>
						<Route
							path="categories"
							element={
								<Suspense fallback={<PlaceholderPage title="Categories" message="Loading categories..." />}>
									<Categories />
								</Suspense>
							}
						/>
						<Route
							path="orders/:orderId"
							element={
								<Suspense fallback={<PlaceholderPage title="Orders" message="Loading order details..." />}>
									<OrderDetails />
								</Suspense>
							}
						/>
						<Route
							path="orders"
							element={
								<Suspense fallback={<PlaceholderPage title="Orders" message="Loading orders..." />}>
									<Orders />
								</Suspense>
							}
						/>
						<Route
							path="settings"
							element={
								<Suspense fallback={<PlaceholderPage title="Settings" message="Loading store settings..." />}>
									<Settings />
								</Suspense>
							}
						/>
						<Route
							path="profile"
							element={
								<Suspense fallback={<PlaceholderPage title="Profile" message="Loading profile..." />}>
									<Profile />
								</Suspense>
							}
						/>
						<Route
							path="access-denied"
							element={
								<Suspense fallback={<PlaceholderPage title="Access denied" message="Loading access status..." />}>
									<AccessDenied />
								</Suspense>
							}
						/>
						<Route
							path="*"
							element={
								<PlaceholderPage
									title="Page not found"
									message="The page you requested does not exist."
									action={{ label: 'Return to Dashboard', to: '/dashboard' }}
								/>
							}
						/>
					</Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;