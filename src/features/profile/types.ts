export interface DemoProfile {
	name: string;
	email: string;
}

export const defaultDemoProfile: DemoProfile = {
	name: 'Admin User',
	email: 'admin@example.com',
};