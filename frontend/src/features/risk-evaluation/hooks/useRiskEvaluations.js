import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

const formatRiskRecord = (record) => ({
  provinceId: record.province_id,
  riskLevel: record.risk_level,
  calculatedAt: record.calculated_at
})

const mapByProvinceId = (records = []) => {
  return records.reduce((acc, record) => {
    acc[record.provinceId] = record
    return acc
  }, {})
}

export const useRiskEvaluations = () => {
  const [riskByProvince, setRiskByProvince] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('risk_evaluations')
        .select('province_id, risk_level, calculated_at')

      if (fetchError) {
        throw fetchError
      }

      if (data) {
        const formatted = data.map(formatRiskRecord)
        setRiskByProvince(mapByProvinceId(formatted))
      }
    } catch (err) {
      console.error('Failed to fetch risk evaluations', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  useEffect(() => {
    const channel = supabase.channel('realtime:risk-evaluations')

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'risk_evaluations'
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload

        setRiskByProvince((prev) => {
          const updated = { ...prev }

          if (eventType === 'DELETE' && oldRecord) {
            delete updated[oldRecord.province_id]
            return updated
          }

          if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRecord) {
            updated[newRecord.province_id] = formatRiskRecord(newRecord)
            return updated
          }

          return prev
        })
      }
    )

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to risk evaluations updates')
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const riskSummary = useMemo(() => {
    const provinces = Object.values(riskByProvince)

    if (!provinces.length) {
      return {
        total: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    }

    return provinces.reduce(
      (acc, province) => {
        acc.total += 1

        switch ((province.riskLevel || '').toLowerCase()) {
          case 'high':
            acc.high += 1
            break
          case 'medium':
            acc.medium += 1
            break
          case 'low':
            acc.low += 1
            break
          default:
            break
        }

        return acc
      },
      { total: 0, high: 0, medium: 0, low: 0 }
    )
  }, [riskByProvince])

  return {
    riskByProvince,
    loading,
    error,
    riskSummary,
    refetch: fetchInitialData
  }
}

export default useRiskEvaluations


