import { isMobileMenuOpen, setIsMobileMenuOpen } from '@signals/mobileMenu'
import { onCleanup, onMount, For } from 'solid-js'

type Props = {
  menuItems: { href: string; title: string }[]
}

export const MobileMenu = (props: Props) => {
  onMount(() => {
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (!isMobileMenuOpen()) return

      const target = event.target instanceof Element ? event.target : null
      if (
        target?.closest('[data-mobile-menu]') ||
        target?.closest('[data-mobile-menu-button]')
      ) {
        return
      }

      setIsMobileMenuOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown)

    onCleanup(() => {
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown)
    })
  })

  return (
    <div
      data-mobile-menu
      class="bg-black w-full lg:hidden py-4 border-t border-stone-200 absolute top-full left-0 z-20"
      role="navigation"
      aria-label="Mobile navigation"
      classList={{ hidden: !isMobileMenuOpen() }}
    >
      <nav class="flex flex-col space-y-3 text-center" role="menu">
        <For each={props.menuItems}>
          {({ href, title }) => {
            return (
              <a
                href={href}
                role="menuitem"
                class="text-white font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {title}
              </a>
            )
          }}
        </For>
      </nav>
    </div>
  )
}
