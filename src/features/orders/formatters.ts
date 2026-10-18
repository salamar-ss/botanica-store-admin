const currencyFormatter = new Intl.NumberFormat('en-IE', {
	style: 'currency',
	currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('en-IE', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IE', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
});

export function formatOrderCurrency(amount: number): string {
	return currencyFormatter.format(amount);
}

export function formatOrderDate(dateString: string): string {
	return dateFormatter.format(new Date(dateString));
}

export function formatOrderDateTime(dateString: string): string {
	return dateTimeFormatter.format(new Date(dateString));
}