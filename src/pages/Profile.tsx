import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { demoProfileSchema, type DemoProfileFormInput, type DemoProfileFormValues } from '@/features/profile/schema';
import { saveDemoProfile } from '@/features/profile/profileStore';
import { useDemoProfile } from '@/features/profile/useDemoProfile';
import type { DemoProfile } from '@/features/profile/types';
import '@/pages/Profile.scss';

export default function Profile() {
	const profile = useDemoProfile();
	const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty, isSubmitting },
	} = useForm<DemoProfileFormInput, undefined, DemoProfileFormValues>({
		resolver: zodResolver(demoProfileSchema),
		defaultValues: profile,
	});

	const saveProfile = async (values: DemoProfile) => {
		setFeedback(null);
		try {
			saveDemoProfile(values);
			reset(values);
			setFeedback({
				kind: 'success',
				message: 'Profile saved in this browser only. No server account was updated.',
			});
		} catch {
			setFeedback({
				kind: 'error',
				message: 'Profile could not be saved in this browser. Check local storage availability and try again.',
			});
		}
	};

	const cancelChanges = () => {
		if (isDirty && !window.confirm('Discard your unsaved profile changes?')) return;
		reset(profile);
		setFeedback(null);
	};

	return (
		<main className="profile-page" aria-labelledby="profile-page-title">
			<header className="profile-page__heading">
				<h2 className="profile-page__title" id="profile-page-title">User profile</h2>
				<p className="profile-page__subtitle">Manage the demo administrator profile.</p>
			</header>

			<p className="profile-page__notice">
				This demo profile is stored in this browser only. It is not connected to authentication and is not saved to a server.
			</p>

			<form className="profile-page__form" noValidate onSubmit={handleSubmit(saveProfile)}>
				<section className="profile-page__section" aria-labelledby="profile-details-title">
					<h3 className="profile-page__section-title" id="profile-details-title">Profile details</h3>
					<div className="profile-page__fields">
						<div className="profile-page__field">
							<label className="profile-page__label" htmlFor="profile-name">Name</label>
							<input
								className="profile-page__input"
								id="profile-name"
								maxLength={80}
								aria-invalid={Boolean(errors.name)}
								aria-describedby={errors.name ? 'profile-name-error' : undefined}
								{...register('name')}
							/>
							{errors.name?.message && <span className="profile-page__field-error" id="profile-name-error">{errors.name.message}</span>}
						</div>
						<div className="profile-page__field">
							<label className="profile-page__label" htmlFor="profile-email">Email</label>
							<input
								className="profile-page__input"
								id="profile-email"
								type="email"
								maxLength={254}
								autoComplete="email"
								aria-invalid={Boolean(errors.email)}
								aria-describedby={errors.email ? 'profile-email-error' : undefined}
								{...register('email')}
							/>
							{errors.email?.message && <span className="profile-page__field-error" id="profile-email-error">{errors.email.message}</span>}
						</div>
					</div>
				</section>

				{feedback && (
					<p className={`profile-page__feedback profile-page__feedback--${feedback.kind}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
						{feedback.message}
					</p>
				)}

				<div className="profile-page__actions">
					<button className="profile-page__cancel" type="button" onClick={cancelChanges} disabled={isSubmitting}>
						Cancel
					</button>
					<button className="profile-page__save" type="submit" disabled={!isDirty || isSubmitting}>
						{isSubmitting ? 'Saving...' : 'Save profile'}
					</button>
				</div>
			</form>
		</main>
	);
}