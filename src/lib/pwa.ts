import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

/**
 * Handles service-worker registration (auto-update) and exposes an install
 * button when the browser fires `beforeinstallprompt`.
 */
export function usePwaInstall() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    registerSW({ immediate: true })

    function onPrompt(e: BeforeInstallPromptEvent) {
      e.preventDefault()
      setInstallEvent(e)
    }
    function onInstalled() {
      setInstalled(true)
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt as EventListener)
    window.addEventListener('appinstalled', onInstalled as EventListener)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as EventListener)
      window.removeEventListener('appinstalled', onInstalled as EventListener)
    }
  }, [])

  async function promptInstall() {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') setInstallEvent(null)
  }

  return { canInstall: !!installEvent && !installed, installed, promptInstall }
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
