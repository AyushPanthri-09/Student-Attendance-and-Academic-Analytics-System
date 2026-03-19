const ANALYTICS_DATA_CHANGED_EVENT = 'analytics:data-changed';

export const emitAnalyticsDataChanged = (source = 'unknown') => {
  window.dispatchEvent(
    new CustomEvent(ANALYTICS_DATA_CHANGED_EVENT, {
      detail: { source, timestamp: Date.now() }
    })
  );
};

export const onAnalyticsDataChanged = (handler) => {
  window.addEventListener(ANALYTICS_DATA_CHANGED_EVENT, handler);
  return () => window.removeEventListener(ANALYTICS_DATA_CHANGED_EVENT, handler);
};
