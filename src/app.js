import { createApp } from 'vue';
import Toast from 'vue-toastification';
import * as Sentry from '@sentry/vue';
import { Integrations as SentryIntegrations } from '@sentry/tracing';

import Main from './components/Main';

const app = createApp(Main);

Sentry.init({
	app,
	dsn: process.env.MIX_SENTRY_DSN_FRONTEND,
	integrations: [new SentryIntegrations.BrowserTracing()],
	logErrors: true,
	release: process.env.MIX_COMMIT_HASH,
});

app.use(Toast);

app.mount('#main');

window.addEventListener('hashchange', () => window.location.reload(), true);
