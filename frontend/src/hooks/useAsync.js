import { useEffect, useState } from 'react';

export default function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    asyncFn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err) => active && setState({
        data: null,
        loading: false,
        error: err?.message || 'No pudimos cargar la información. Intenta de nuevo.',
      }));
    return () => { active = false; };
  }, deps);

  return state;
}
