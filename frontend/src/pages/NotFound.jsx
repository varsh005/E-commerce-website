import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section empty-state">
      <h1>404</h1>
      <p className="muted">This page wandered off the shelf.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </div>
  );
}
