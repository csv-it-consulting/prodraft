import Vue from 'vue';
import * as Sentry from '@sentry/vue';
import { Integrations as SentryIntegrations } from '@sentry/tracing';

import Main from './components/Main';

Sentry.init({
	Vue,
	dsn: process.env.MIX_SENTRY_DSN_FRONTEND,
	integrations: [new SentryIntegrations.BrowserTracing()],
	logErrors: true,
	release: process.env.MIX_COMMIT_HASH,
});

// Extend Vue
const App = Vue.extend({ render: renderer => renderer(Main) });

// Instantiate the application
(new App).$mount('#main');

window.addEventListener('hashchange', () => window.location.reload(), true);
