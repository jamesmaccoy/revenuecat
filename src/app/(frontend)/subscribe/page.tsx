'use client'

import React, { useEffect, useState } from 'react'
import { useUserContext } from '@/context/UserContext'
import { useRevenueCat } from '@/providers/RevenueCat'
import { useSubscription } from '@/hooks/useSubscription'
import { Purchases, Package, PurchasesError, ErrorCode } from '@revenuecat/purchases-js'
import { useRouter } from 'next/navigation'

export default function SubscribePage() {
  const router = useRouter()
  const { currentUser } = useUserContext()
  const { customerInfo, isInitialized } = useRevenueCat()
  const { isSubscribed } = useSubscription()
  const [offerings, setOfferings] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('RevenueCat initialized:', isInitialized)
    if (isInitialized) {
      loadOfferings()
    }
  }, [isInitialized])

  // Redirect to dashboard if already subscribed
  useEffect(() => {
    if (isSubscribed) {
      router.push('/admin')
    }
  }, [isSubscribed, router])

  const loadOfferings = async () => {
    try {
      console.log('Loading offerings...')
      const offerings = await Purchases.getSharedInstance().getOfferings()
      console.log('Received offerings:', offerings)
      
      if (!offerings.current) {
        console.error('No current offering available')
        setError('No subscription offerings available')
        setLoading(false)
        return
      }

      if (offerings.current.availablePackages.length === 0) {
        console.error('No available packages in current offering')
        setError('No subscription packages available')
        setLoading(false)
        return
      }

      console.log('Setting offerings:', offerings.current.availablePackages)
      setOfferings(offerings.current.availablePackages)
      setLoading(false)
    } catch (err) {
      console.error('Error loading offerings:', err)
      setError('Failed to load subscription offerings')
      setLoading(false)
    }
  }

  const handlePurchase = async (pkg: Package) => {
    try {
      await Purchases.getSharedInstance().purchase({
        rcPackage: pkg
      })
      router.push('/admin')
    } catch (error) {
      if (error.code === 'RECEIPT_ALREADY_IN_USE') {
        router.push('/admin')
        return
      }
      if (error.code === 'CANCELLED') {
        return
      }
      console.error('Error purchasing package:', error)
      setError('Failed to complete purchase. Please try again.')
    }
  }

  if (!currentUser) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Subscribe1</h1>
        <p>Please log in to view subscription options.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading subscription options...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  const hasActiveSubscription = customerInfo && Object.keys(customerInfo.entitlements.active).length > 0

  if (hasActiveSubscription) {
    // Redirect to admin instead of showing subscription active message
    router.push('/admin')
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Subscription</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offerings.map((pkg) => {
          const product = pkg.webBillingProduct
          return (
            <div key={pkg.identifier} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">{product.displayName}</h2>
              <p className="mb-4">{product.description}</p>
              <p className="text-lg font-bold mb-4">
                {product.currentPrice.formattedPrice}
              </p>
              <button
                onClick={() => handlePurchase(pkg)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Subscribe
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}