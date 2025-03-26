import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { RevenueCatProvider } from './RevenueCat'
import { UserProvider } from '@/context/UserContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <UserProvider>
      <ThemeProvider>
        <HeaderThemeProvider>
          <RevenueCatProvider>
            {children}
          </RevenueCatProvider>
        </HeaderThemeProvider>
      </ThemeProvider>
    </UserProvider>
  )
}
