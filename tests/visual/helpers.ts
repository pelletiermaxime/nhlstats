import { test, type Page } from '@playwright/test'

export interface NuxtRoot extends HTMLElement {
  __vue_app__?: {
    config: {
      globalProperties: {
        $nuxt?: {
          isHydrating: boolean
          $config: { public: { convex: { url: string } } }
        }
      }
    }
  }
}

export async function openHydratedPage(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () => {
      const root = document.querySelector<NuxtRoot>('#__nuxt')
      return root?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false
    },
    undefined,
    { timeout: test.info().timeout },
  )
}
