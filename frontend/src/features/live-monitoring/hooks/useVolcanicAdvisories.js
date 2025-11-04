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
      // Fetch only advisories with alert_level > 0
      const { data, error: fetchError } = await supabase
        .from('volcanic_advisories')
        .select('*')
        .gt('alert_level', 0)
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
    // Create unique channel per component instance
    const channelName = `volcanic-advisories-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase.channel(channelName);
    console.log(`🔌 Creating channel: ${channelName}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'volcanic_advisories',
      },
      (payload) => {
        console.log('🌋 Realtime volcanic advisory update:', payload);
        const { eventType, new: newRecord, old: oldRecord } = payload;

        setAdvisories((prev) => {
          if (eventType === 'DELETE' && oldRecord) {
            console.log('🗑️ Deleting advisory:', oldRecord.volcano_id);
            return prev.filter((adv) => adv.id !== oldRecord.volcano_id);
          }

          if (eventType === 'INSERT' && newRecord) {
            console.log('➕ Inserting advisory:', newRecord);
            // Only add if alert_level > 0
            if (newRecord.alert_level > 0) {
              const formatted = formatAdvisory(newRecord);
              const newList = [...prev, formatted].sort((a, b) => b.alertLevel - a.alertLevel);
              console.log('✅ New advisories list after INSERT:', newList);
              return newList;
            }
            console.log('⏭️ Skipping INSERT (alert_level is 0)');
            return prev;
          }

          if (eventType === 'UPDATE' && newRecord) {
            console.log('🔄 Updating advisory:', newRecord);
            // Remove if alert_level becomes 0, otherwise update
            if (newRecord.alert_level === 0 || newRecord.alert_level === null) {
              console.log('🗑️ Removing advisory (alert_level is 0 or null)');
              const filtered = prev.filter((adv) => adv.id !== newRecord.volcano_id);
              console.log('✅ New advisories list after removal:', filtered);
              return filtered;
            }
            
            const formatted = formatAdvisory(newRecord);
            const exists = prev.some((adv) => adv.id === newRecord.volcano_id);
            
            if (exists) {
              console.log('🔄 Updating existing advisory');
              const updated = prev.map((adv) =>
                adv.id === newRecord.volcano_id ? formatted : adv
              ).sort((a, b) => b.alertLevel - a.alertLevel);
              console.log('✅ New advisories list after UPDATE:', updated);
              return updated;
            } else {
              console.log('➕ Adding new advisory (wasn\'t in list before)');
              const newList = [...prev, formatted].sort((a, b) => b.alertLevel - a.alertLevel);
              console.log('✅ New advisories list after adding:', newList);
              return newList;
            }
          }

          return prev;
        });
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to volcanic advisories realtime updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error subscribing to volcanic advisories');
      } else if (status === 'TIMED_OUT') {
        console.error('⏱️ Subscription to volcanic advisories timed out');
      } else {
        console.log('� Volcanic advisories subscription status:', status);
      }
    });

    return () => {
      console.log('🔒 Unsubscribing from volcanic advisories realtime updates');
      channel.unsubscribe();
    };
  }, []);

  return { advisories, loading, error };
};
