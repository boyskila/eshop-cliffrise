import Menu from 'lucide-solid/icons/menu'
import X from 'lucide-solid/icons/x'
import { isMobileMenuOpen, setIsMobileMenuOpen } from '@signals/mobileMenu'

export const MobileMenuButton = () => {
  return (
    <div class="md:hidden flex items-center space-x-2">
      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        aria-label={isMobileMenuOpen() ? 'Close Menu' : 'Open Menu'}
        aria-expanded={isMobileMenuOpen()}
        class="text-white p-2"
      >
        {isMobileMenuOpen() ? <X class="h-6 w-6" /> : <Menu class="h-6 w-6" />}
      </button>
    </div>
  )
}
