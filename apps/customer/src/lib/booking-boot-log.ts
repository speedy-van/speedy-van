export function logBookingBoot(route?: string) {
  if (typeof window === 'undefined') return;
  if (document.querySelector('[data-page="booking"]')) {
    // eslint-disable-next-line no-console
    console.log(
      '[Booking] wrapper active on route:',
      route || window.location.pathname
    );
  }
}
