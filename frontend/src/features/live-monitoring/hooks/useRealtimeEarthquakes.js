import { useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'

/**
 * Hook for subscribing to real-time earthquake updates from Supabase
 * @param {Object} options - Configuration options
 * @param {Function} options.onInsert - Callback when new earthquake is inserted
 * @param {Function} options.onUpdate - Callback when earthquake is updated
 * @param {Function} options.onDelete - Callback when earthquake is deleted
 * @param {string} options.filter - Optional filter for subscription (e.g., "magnitude=gte.3.0")
 */
export const useRealtimeEarthquakes = ({ onInsert, onUpdate, onDelete, filter } = {}) => {
  const handlersRef = useRef({ onInsert, onUpdate, onDelete })

  // Update handlers ref when callbacks change
  useEffect(() => {
    handlersRef.current = { onInsert, onUpdate, onDelete }
  }, [onInsert, onUpdate, onDelete])

  useEffect(() => {
    const channelName = `realtime:earthquakes${filter ? `:${filter}` : ''}`
    const channel = supabase.channel(channelName)

    // Configure postgres changes subscription
    const subscriptionConfig = {
      event: '*',
      schema: 'public',
      table: 'earthquakes'
    }

    if (filter) {
      subscriptionConfig.filter = filter
    }

    channel.on('postgres_changes', subscriptionConfig, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload

      switch (eventType) {
        case 'INSERT':
          if (handlersRef.current.onInsert) {
            handlersRef.current.onInsert(newRecord, payload)
          }
          break
        case 'UPDATE':
          if (handlersRef.current.onUpdate) {
            handlersRef.current.onUpdate(newRecord, payload)
          }
          break
        case 'DELETE':
          if (handlersRef.current.onDelete) {
            handlersRef.current.onDelete(oldRecord, payload)
          }
          break
        default:
          console.log('Unknown event type:', eventType)
      }
    })

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to earthquake updates')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error subscribing to earthquake updates')
      } else if (status === 'TIMED_OUT') {
        console.warn('⏰ Subscription timed out')
      } else if (status === 'CLOSED') {
        console.log('🔒 Subscription closed')
      }
    })

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])
}

export default useRealtimeEarthquakes
