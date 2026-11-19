import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from './EmptyState';

export default function NotFound() {
  return (
    <div className="container page-pad">
      <EmptyState
        icon={Compass}
        title="This page wandered off"
        action={<Link to="/" className="btn btn--primary">Back to the shop</Link>}
      >
        The page you're looking for doesn't exist or has moved.
      </EmptyState>
    </div>
  );
}
