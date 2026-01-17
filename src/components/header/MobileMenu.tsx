import { isMobileMenuOpen } from '@signals/mobileMenu'
import type { Translations } from '@types'

type Props = {
  menuItems: { href: string; title: string }[]
}

export const MobileMenu = (props: Props) => {
  return (
    <div
      class="bg-black/95 w-full lg:hidden py-4 border-t border-stone-200 dark:border-stone-700 bg-gray-900 absolute top-full left-0 z-20"
      role="navigation"
      aria-label="Mobile navigation"
      classList={{ hidden: !isMobileMenuOpen() }}
    >
      <nav class="flex flex-col space-y-3 text-center" role="menu">
        {props.menuItems.map(({ href, title }) => {
          return (
            <a href={href} role="menuitem" class="text-white font-medium">
              {title}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
