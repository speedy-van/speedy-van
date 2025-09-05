'use client';
import Link from 'next/link';

export default function LocationLinks({
  city,
  neighbours,
  nofollowSmall = false,
}: {
  city: string;
  neighbours: { name: string; slug: string; population?: number }[];
  nofollowSmall?: boolean;
}) {
  return (
    <nav aria-label={`Popular areas near ${city}`} className="chips">
      {neighbours.map(n => {
        const nofollow =
          nofollowSmall && (!n.population || n.population < 10000);
        return (
          <Link
            key={n.slug}
            href={`/uk/${n.slug}`}
            rel={nofollow ? 'nofollow' : undefined}
            className="location-link"
          >
            {n.name}
          </Link>
        );
      })}

      <style jsx>{`
        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 16px 0;
        }
        .location-link {
          border: 1px solid #333;
          padding: 10px 16px;
          border-radius: 999px;
          text-decoration: none;
          color: #e6f7ff;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }
        .location-link:hover {
          border-color: #39ff14;
          background: rgba(57, 255, 20, 0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </nav>
  );
}
