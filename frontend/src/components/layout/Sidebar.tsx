'use client'

import { 
  Briefcase, 
  UserCheck,
  ChevronRight 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/useI18n'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useI18n()

  const navigation = [
    { name: t('cases'), href: '/cases', icon: Briefcase },
    { name: t('newCase'), href: '/cases/new', icon: UserCheck },
  ]

  return (
    <aside className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-green-500" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>


      {/* Language Switcher */}
      <div className="mt-8 px-8 border-t pt-4">
        <LanguageSwitcher />
      </div>
    </aside>
  )
}