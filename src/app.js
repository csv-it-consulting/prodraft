import Vue from 'vue';

import Main from './components/Main.vue';

// Extend Vue
const App = Vue.extend({ render: renderer => renderer(Main) });

// Instantiate the application
(new App).$mount('#main');
