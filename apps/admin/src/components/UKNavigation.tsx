import Link from 'next/link';

export default function UKNavigation() {
  return (
    <nav className="uk-nav">
      <Link href="/uk" className="uk-nav-link">
        UK Coverage
      </Link>

      <style jsx>{`
        .uk-nav {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .uk-nav-link {
          color: #00e0ff;
          text-decoration: none;
          font-weight: 500;
          padding: 8px 16px;
          border: 1px solid #00e0ff;
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .uk-nav-link:hover {
          background: #00e0ff;
          color: #111;
          box-shadow: 0 0 15px rgba(0, 224, 255, 0.3);
        }
      `}</style>
    </nav>
  );
}
