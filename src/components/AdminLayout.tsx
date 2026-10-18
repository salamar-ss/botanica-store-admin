import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDemoProfile } from '@/features/profile/useDemoProfile';
import { useDemoAuth } from '@/features/auth/useDemoAuth';
import '@/components/AdminLayout.scss';

const navigationItems = [
	{ label: 'Dashboard', to: '/dashboard' },
	{ label: 'Products', to: '/products' },
	{ label: 'Categories', to: '/categories' },
	{ label: 'Orders', to: '/orders' },
	{ label: 'Settings', to: '/settings' },
];

export default function AdminLayout() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { logout } = useDemoAuth();
	const profile = useDemoProfile();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const currentPath = pathname.replace(/\/+$/, '') || '/';
	const pageTitle = navigationItems.find((item) => item.to === currentPath)?.label
		?? (currentPath.startsWith('/orders/')
			? 'Orders'
			: currentPath === '/profile'
				? 'Profile'
				: currentPath === '/access-denied'
					? 'Access denied'
					: 'Not Found');
	const profileInitials = profile.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
	const sidebarClassName = `admin-layout__sidebar${isMenuOpen ? ' admin-layout__sidebar--open' : ''}`;

	return (
		<div className="admin-layout">
			<aside className={sidebarClassName}>
				<div className="admin-layout__sidebar-header">
					<Link
						className="admin-layout__brand"
						to="/dashboard"
						aria-label="Botanica Admin dashboard"
						onClick={() => setIsMenuOpen(false)}
					>
						<span className="admin-layout__brand-mark" aria-hidden="true">
							<svg viewBox="0 0 24 24" fill="none">
								<path d="M19.5 4.5C11 4.5 5 7.7 5 13.4c0 3 2.2 5.1 5 5.1 5.7 0 8.8-6.1 9.5-14Z" />
								<path d="M4 20c2.2-4.7 6.2-7.5 11-9.5" />
							</svg>
						</span>
						<span className="admin-layout__brand-name">Botanica</span>
						<span className="admin-layout__brand-label">ADMIN</span>
					</Link>
					<button
						className="admin-layout__menu-toggle"
						type="button"
						aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
						aria-expanded={isMenuOpen}
						aria-controls="admin-primary-navigation"
						onClick={() => setIsMenuOpen((open) => !open)}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							{isMenuOpen ? (
								<path d="m6 6 12 12M18 6 6 18" />
							) : (
								<path d="M4 7h16M4 12h16M4 17h16" />
							)}
						</svg>
					</button>
				</div>

				<nav
					className="admin-layout__navigation"
					id="admin-primary-navigation"
					aria-label="Primary navigation"
				>
					<ul className="admin-layout__navigation-list">
						{navigationItems.map((item) => (
							<li className="admin-layout__navigation-item" key={item.label}>
								<NavLink
									className={({ isActive }) =>
										`admin-layout__navigation-link${isActive ? ' admin-layout__navigation-link--active' : ''}`
									}
									to={item.to}
									end={item.to !== '/orders'}
									onClick={() => setIsMenuOpen(false)}
								>
									<span>{item.label}</span>
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			<div className="admin-layout__workspace">
				<header className="admin-layout__header">
					<h1 className="admin-layout__page-title">{pageTitle}</h1>
					<div className="admin-layout__header-actions">
						<Link className="admin-layout__profile" to="/profile" aria-label={`Open profile for ${profile.name}`}>
							<span className="admin-layout__avatar" aria-hidden="true">{profileInitials || 'AD'}</span>
							<span className="admin-layout__profile-details">
								<span className="admin-layout__profile-name">{profile.name}</span>
								<span className="admin-layout__profile-role">Store administrator</span>
							</span>
						</Link>
						<button
							className="admin-layout__logout"
							type="button"
							onClick={() => {
								logout();
								navigate('/login', { replace: true });
							}}
						>
							Log out
						</button>
					</div>
				</header>
				<div className="admin-layout__content">
					<Outlet />
				</div>
			</div>
		</div>
	);
}