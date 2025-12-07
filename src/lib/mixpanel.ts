import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
mixpanel.init('290914e4671ae08aa2c3151f0a9b4234', {
  autocapture: true,
  record_sessions_percent: 100,
});

export default mixpanel;

