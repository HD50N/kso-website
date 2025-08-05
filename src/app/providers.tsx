'use client';
import { HumanBehaviorProvider } from 'humanbehavior-js/react'
import { useEffect, useState } from 'react'

function DelayedHumanBehaviorProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Wait for DOM to be fully ready
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 1500) // 1.5 second delay to ensure page is rendered

    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return <>{children}</>
  }

  return (
    <HumanBehaviorProvider 
      apiKey={process.env.NEXT_PUBLIC_HUMANBEHAVIOR_API_KEY!}
      options={{
        logLevel: 'debug'
      }}
    >
      {children}
    </HumanBehaviorProvider>
  )
}

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DelayedHumanBehaviorProvider>
      {children}
    </DelayedHumanBehaviorProvider>
  )
}