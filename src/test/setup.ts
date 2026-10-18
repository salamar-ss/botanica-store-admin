import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

if (typeof HTMLDialogElement !== 'undefined') {
	Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
		configurable: true,
		value(this: HTMLDialogElement) {
			this.setAttribute('open', '');
		},
	});
	Object.defineProperty(HTMLDialogElement.prototype, 'close', {
		configurable: true,
		value(this: HTMLDialogElement) {
			this.removeAttribute('open');
		},
	});
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});