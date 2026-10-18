import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { storeSettingsSchema, type StoreSettingsFormInput, type StoreSettingsFormValues } from '@/features/settings/schema';
import { loadStoreSettings, saveStoreSettings } from '@/features/settings/settingsStorage';
import { currencyOptions, timeZoneOptions, type StoreSettings } from '@/features/settings/types';
import '@/pages/Settings.scss';

function toFormValues(settings: StoreSettings): StoreSettingsFormInput {
	return { ...settings, lowStockThreshold: String(settings.lowStockThreshold) };
}

export default function Settings() {
	const [savedSettings, setSavedSettings] = useState(loadStoreSettings);
	const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<StoreSettingsFormInput, undefined, StoreSettingsFormValues>({
		resolver: zodResolver(storeSettingsSchema),
		defaultValues: toFormValues(savedSettings),
	});

	const saveSettings = async (values: StoreSettingsFormValues) => {
		setFeedback(null);
		try {
			saveStoreSettings(values);
			setSavedSettings(values);
			reset(toFormValues(values));
			setFeedback({
				kind: 'success',
				message: 'Settings saved in this browser only. They are not synced to a server.',
			});
		} catch {
			setFeedback({
				kind: 'error',
				message: 'Settings could not be saved in this browser. Check local storage availability and try again.',
			});
		}
	};

	const cancelChanges = () => {
		if (isDirty && !window.confirm('Discard your unsaved settings changes?')) return;
		reset(toFormValues(savedSettings));
		setFeedback(null);
	};

	return (
		<main className="settings-page" aria-labelledby="settings-page-title">
			<header className="settings-page__heading">
				<h2 className="settings-page__title" id="settings-page-title">Store settings</h2>
				<p className="settings-page__subtitle">Configure the defaults used by this store.</p>
			</header>

			<p className="settings-page__notice">
				Demo settings are stored in this browser only. No settings API is connected, so these values are not saved to a server.
			</p>

			<form className="settings-page__form" noValidate onSubmit={handleSubmit(saveSettings)}>
				<section className="settings-page__section" aria-labelledby="settings-general-title">
					<h3 className="settings-page__section-title" id="settings-general-title">General</h3>
					<div className="settings-page__fields">
						<div className="settings-page__field settings-page__field--wide">
							<label className="settings-page__label" htmlFor="settings-store-name">Store name</label>
							<input
								className="settings-page__input"
								id="settings-store-name"
								maxLength={80}
								aria-invalid={Boolean(errors.storeName)}
								aria-describedby={errors.storeName ? 'settings-store-name-error' : undefined}
								{...register('storeName')}
							/>
							{errors.storeName?.message && <span className="settings-page__field-error" id="settings-store-name-error">{errors.storeName.message}</span>}
						</div>
						<div className="settings-page__field">
							<label className="settings-page__label" htmlFor="settings-currency">Currency</label>
							<select
								className="settings-page__select"
								id="settings-currency"
								aria-invalid={Boolean(errors.currency)}
								aria-describedby={errors.currency ? 'settings-currency-error' : undefined}
								{...register('currency')}
							>
								{currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
							</select>
							{errors.currency?.message && <span className="settings-page__field-error" id="settings-currency-error">{errors.currency.message}</span>}
						</div>
						<div className="settings-page__field">
							<label className="settings-page__label" htmlFor="settings-time-zone">Time zone</label>
							<select
								className="settings-page__select"
								id="settings-time-zone"
								aria-invalid={Boolean(errors.timeZone)}
								aria-describedby={errors.timeZone ? 'settings-time-zone-error' : undefined}
								{...register('timeZone')}
							>
								{timeZoneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
							</select>
							{errors.timeZone?.message && <span className="settings-page__field-error" id="settings-time-zone-error">{errors.timeZone.message}</span>}
						</div>
						<div className="settings-page__field">
							<label className="settings-page__label" htmlFor="settings-stock-threshold">Low-stock threshold</label>
							<input
								className="settings-page__input"
								id="settings-stock-threshold"
								type="number"
								min="0"
								max="10000"
								step="1"
								aria-invalid={Boolean(errors.lowStockThreshold)}
								aria-describedby={errors.lowStockThreshold ? 'settings-stock-threshold-error' : 'settings-stock-threshold-help'}
								{...register('lowStockThreshold')}
							/>
							{errors.lowStockThreshold?.message
								? <span className="settings-page__field-error" id="settings-stock-threshold-error">{errors.lowStockThreshold.message}</span>
								: <span className="settings-page__field-help" id="settings-stock-threshold-help">Whole number from 0 to 10,000 units.</span>}
						</div>
					</div>
				</section>

				{feedback && (
					<p className={`settings-page__feedback settings-page__feedback--${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
						{feedback.message}
					</p>
				)}

				<div className="settings-page__actions">
					<button className="settings-page__cancel" type="button" onClick={cancelChanges} disabled={isSubmitting}>
						Cancel
					</button>
					<button className="settings-page__save" type="submit" disabled={!isDirty || isSubmitting}>
						{isSubmitting ? 'Saving...' : 'Save settings'}
					</button>
				</div>
			</form>
		</main>
	);
}