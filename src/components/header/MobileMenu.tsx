import { isMobileMenuOpen } from '@signals/mobileMenu'
import type { Translations } from '@types'

type Props = {
  menuItems: { href: string; title: string }[]
}

export const MobileMenu = (props: Props) => {
  return (
    <div
      class="md:hidden py-4 border-t border-stone-200 dark:border-stone-700"
      role="navigation"
      aria-label="Mobile navigation"
      classList={{ hidden: !isMobileMenuOpen() }}
    >
      <nav class="flex flex-col space-y-3" role="menu">
        {props.menuItems.map(({ href, title }) => {
          return (
            <a
              href={href}
              role="menuitem"
              class="text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
            >
              {title}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
