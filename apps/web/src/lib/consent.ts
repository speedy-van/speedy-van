export type ConsentCategories = {
	necessary: boolean;
	functional: boolean;
	analytics: boolean;
	marketing: boolean;
};

export type ConsentState = ConsentCategories & {
	version: number;
	timestamp: number;
	region?: string | null;
};

export const DEFAULT_CONSENT: ConsentState = {
	version: 2,
	timestamp: 0,
	region: "UK",
	necessary: true,
	functional: false,
	analytics: false,
	marketing: false,
};

export function parseConsentCookie(cookieValue: string | undefined | null): ConsentState {
	if (!cookieValue) return { ...DEFAULT_CONSENT };
	try {
		// format: v=2|nec=1|func=0|ana=0|mkt=0|ts=1699999999|region=UK
		const parts = cookieValue.split("|");
		const map: Record<string, string> = {};
		for (const part of parts) {
			const [k, v] = part.split("=");
			if (k && v !== undefined) map[k] = v;
		}
		const version = Number(map.v || 2);
		const necessary = map.nec ? map.nec === "1" : true;
		const functional = map.func === "1";
		const analytics = map.ana === "1";
		const marketing = map.mkt === "1";
		const timestamp = Number(map.ts || 0);
		const region = map.region || null;
		return { version, necessary, functional, analytics, marketing, timestamp, region };
	} catch {
		return { ...DEFAULT_CONSENT };
	}
}

export function serializeConsentCookie(consent: ConsentState): string {
	const ts = consent.timestamp && consent.timestamp > 0 ? consent.timestamp : Math.floor(Date.now() / 1000);
	return [
		`v=${consent.version || 2}`,
		`nec=${consent.necessary ? 1 : 0}`,
		`func=${consent.functional ? 1 : 0}`,
		`ana=${consent.analytics ? 1 : 0}`,
		`mkt=${consent.marketing ? 1 : 0}`,
		`ts=${ts}`,
		`region=${consent.region || "UK"}`,
	].join("|");
}

export function toGoogleConsent(consent: ConsentState) {
	return {
		ad_user_data: consent.marketing ? "granted" : "denied",
		ad_personalization: consent.marketing ? "granted" : "denied",
		ad_storage: consent.marketing ? "granted" : "denied",
		analytics_storage: consent.analytics ? "granted" : "denied",
	};
}


