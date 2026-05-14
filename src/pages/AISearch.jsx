import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AISearch() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  useEffect(() => {
    const make = params.get('make') || '';
    navigate(make ? `/search?q=${encodeURIComponent(make)}` : '/search', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
