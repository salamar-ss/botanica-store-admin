import type { OrderStatus } from '@/features/orders/types';

export type ReportingPeriod = '7d' | '30d' | '90d' | '12m';

export interface RevenueDataPoint {
	dateKey: string;
	label: string;
	revenue: number;
}

export interface OrderStatusDataPoint {
	status: OrderStatus;
	count: number;
	share: number;
}

export interface DashboardAnalyticsData {
	periodOrderCount: number;
	paidOrderCount: number;
	paidRevenue: number;
	revenue: RevenueDataPoint[];
	orderStatuses: OrderStatusDataPoint[];
}