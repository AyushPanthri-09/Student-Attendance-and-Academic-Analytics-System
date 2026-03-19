import { useEffect, useMemo, useState } from 'react';

export default function useChartScale() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return useMemo(() => {
    if (width < 640) {
      return {
        axisFontSize: 10,
        axisDy: 14,
        xTickHeight: 64,
        bottomMargin: 64,
        shouldRotate: false,
      };
    }

    if (width < 1024) {
      return {
        axisFontSize: 11,
        axisDy: 14,
        xTickHeight: 50,
        bottomMargin: 44,
        shouldRotate: false,
      };
    }

    return {
      axisFontSize: 12,
      axisDy: 14,
      xTickHeight: 42,
      bottomMargin: 24,
      shouldRotate: false,
    };
  }, [width]);
}
