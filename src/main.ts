import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import 'highlight.js/styles/github.css'

function installAuthenticationRedirect(): void {
  const nativeFetch = window.fetch.bind(window)

  window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
    const response = await nativeFetch(...args)
    if (response.status !== 401) {
      return response
    }

    const input = args[0]
    const requestUrl = input instanceof Request ? input.url : String(input)
    const url = new URL(requestUrl, window.location.href)
    if (
      url.origin === window.location.origin &&
      url.pathname.startsWith('/codex-api/') &&
      window.location.pathname !== '/auth/login'
    ) {
      window.location.replace('/auth/login')
    }

    return response
  }
}

installAuthenticationRedirect()
createApp(App).use(router).mount('#app')
