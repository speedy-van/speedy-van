'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ConsentState, DEFAULT_CONSENT, toGoogleConsent } from '@/lib/consent';

type ConsentContextValue = {
	consent: ConsentState;
	setConsent: (next: Partial<Pick<ConsentState, 'functional' | 'analytics' | 'marketing' | 'region'>>) => Promise<void>;
	acceptAll: () => Promise<void>;
	rejectNonEssential: () => Promise<void>;
	openPreferences: () => void;
	closePreferences: () => void;
	isPreferencesOpen: boolean;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

async function postConsentUpdate(body: Partial<Pick<ConsentState, 'functional' | 'analytics' | 'marketing' | 'region'>>) {
	await fetch('/api/consent', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		credentials: 'include',
	});
}

export function ConsentProvider({ initialConsent, children }: { initialConsent: ConsentState; children: React.ReactNode }) {
	const [consent, setConsentState] = useState<ConsentState>(initialConsent || DEFAULT_CONSENT);
	const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

	const updateGoogleConsent = useCallback((state: ConsentState) => {
		try {
			const w = window as any;
			if (typeof w.gtag === 'function') {
				w.gtag('consent', 'update', toGoogleConsent(state));
			}
		} catch {}
	}, []);

	const setConsent = useCallback(async (next: Partial<Pick<ConsentState, 'functional' | 'analytics' | 'marketing' | 'region'>>) => {
		const merged: ConsentState = {
			...consent,
			functional: next.functional ?? consent.functional,
			analytics: next.analytics ?? consent.analytics,
			marketing: next.marketing ?? consent.marketing,
			region: next.region ?? consent.region,
			timestamp: Math.floor(Date.now() / 1000),
		};
		setConsentState(merged);
		await postConsentUpdate({ functional: merged.functional, analytics: merged.analytics, marketing: merged.marketing, region: merged.region });
		updateGoogleConsent(merged);
	}, [consent, updateGoogleConsent]);

	const acceptAll = useCallback(async () => {
		await setConsent({ functional: true, analytics: true, marketing: true });
		setIsPreferencesOpen(false);
	}, [setConsent]);

	const rejectNonEssential = useCallback(async () => {
		await setConsent({ functional: false, analytics: false, marketing: false });
		try {
			// Clear first-party non-essential localStorage keys with prefix 'sv:'
			for (let i = localStorage.length - 1; i >= 0; i -= 1) {
				const key = localStorage.key(i);
				if (!key) continue;
				if (key.startsWith('sv:')) localStorage.removeItem(key);
			}
		} catch {}
		setIsPreferencesOpen(false);
	}, [setConsent]);

	const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
	const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

	const value = useMemo<ConsentContextValue>(() => ({ consent, setConsent, acceptAll, rejectNonEssential, openPreferences, closePreferences, isPreferencesOpen }), [consent, setConsent, acceptAll, rejectNonEssential, openPreferences, closePreferences, isPreferencesOpen]);

	return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
	const ctx = useContext(ConsentContext);
	if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
	return ctx;
}


