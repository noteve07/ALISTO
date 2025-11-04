import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import volcanoLookup from '../utils/volcanoLookup';

const formatAdvisory = (record) => {
  const lookup = volcanoLookup[record.volcano_id] ?? {};
  return {
    id: record.volcano_id,
    volcano: lookup.name ?? `Volcano ${record.volcano_id ?? ''}`,
    alertLevel: record.alert_level ?? null,
    alertStatus: record.alert_status ?? 'Status unavailable',
    issuanceDate: record.issuance_date ?? null,
    bulletinLink: record.bulletin_link ?? null,
  };
};

export const useVolcanicAdvisories = () => {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try without filter first to see all data
      const { data, error: fetchError } = await supabase
        .from('volcanic_advisories')
        .select('*')
        .order('alert_level', { ascending: false })
        .order('issuance_date', { ascending: false });

      if (fetchError) {
        console.error('❌ Supabase query error:', fetchError);
        throw fetchError;
      }

      if (data) {
        console.log('🌋 Raw volcanic advisories data from Supabase:', data);
        const formatted = data.map(formatAdvisory);
        console.log('🌋 Formatted volcanic advisories:', formatted);
        setAdvisories(formatted);
      }
    } catch (err) {
      console.error('❌ Failed to fetch volcanic advisories', err);
      setError('Unable to fetch advisories right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const channel = supabase.channel('realtime:volcanic-advisories');

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'volcanic_advisories',
      },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setAdvisories((prev) => {
          if (eventType === 'DELETE' && oldRecord) {
            return prev.filter((adv) => adv.id !== oldRecord.volcano_id);
          }

          if (eventType === 'INSERT' && newRecord) {
            // Only add if alert_level > 0
            if (newRecord.alert_level > 0) {
              const formatted = formatAdvisory(newRecord);
              return [...prev, formatted].sort((a, b) => b.alertLevel - a.alertLevel);
            }
            return prev;
          }

          if (eventType === 'UPDATE' && newRecord) {
            // Remove if alert_level becomes 0, otherwise update
            if (newRecord.alert_level === 0) {
              return prev.filter((adv) => adv.id !== newRecord.volcano_id);
            }
            
            const formatted = formatAdvisory(newRecord);
            const exists = prev.some((adv) => adv.id === newRecord.volcano_id);
            
            if (exists) {
              return prev.map((adv) =>
                adv.id === newRecord.volcano_id ? formatted : adv
              ).sort((a, b) => b.alertLevel - a.alertLevel);
            } else {
              return [...prev, formatted].sort((a, b) => b.alertLevel - a.alertLevel);
            }
          }

          return prev;
        });
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to volcanic advisories updates');
      }
    });

    return () => {
      console.log('🔒 Volcanic advisories subscription closed');
      channel.unsubscribe();
    };
  }, []);

  return { advisories, loading, error };
};
