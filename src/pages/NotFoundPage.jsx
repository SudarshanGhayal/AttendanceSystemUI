import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state" style={{ paddingTop: 100 }}>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <Link className="btn btn-primary" to="/">Back to dashboard</Link>
    </div>
  );
}