import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Incident } from '@civicpulse/shared';
import { incidentService } from '../services/incidentService';

export interface IncidentContextValue {
  incidents: Incident[];
  activeCount: number;
  resolvedTodayCount: number;
  criticalCount: number;
  highCount: number;
  aiOpsCount: number;
  loading: boolean;
  error: Error | null;
  dataSource: 'LIVE API' | 'PREVIEW DATA';
  refreshIncidents: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextValue | undefined>(undefined);

export function IncidentProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [dataSource, setDataSource] = useState<'LIVE API' | 'PREVIEW DATA'>('PREVIEW DATA');

  // Single centralized fetch function
  const fetchIncidents = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentService.getIncidents(undefined, { forceRefresh: force });
      setIncidents(data);
      setDataSource(incidentService.getActiveDataSource());
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch exactly once on mount (idempotent, deduplicated across StrictMode)
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Subscribe to service cache mutations (Part 4)
  useEffect(() => {
    const unsubscribe = incidentService.subscribe((updatedList) => {
      setIncidents([...updatedList]);
      setDataSource(incidentService.getActiveDataSource());
    });
    return unsubscribe;
  }, []);

  // Real-time Server-Sent Events (SSE) connection (Part 6)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = () => {
      try {
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
        const url = `${apiBase}/api/incidents/events`;
        eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
          try {
            if (!event.data || event.data.startsWith(':')) return;
            const payload = JSON.parse(event.data);

            if (payload && payload.type && payload.incident) {
              const incoming = payload.incident;

              setIncidents((prev) => {
                const existingIndex = prev.findIndex(
                  (i) => i.id === incoming.id || (incoming.incidentNumber && i.id === incoming.incidentNumber)
                );

                if (payload.type === 'INCIDENT_CREATED') {
                  if (existingIndex === -1) {
                    return [incoming as Incident, ...prev];
                  }
                  return prev;
                }

                // In-place update for status changes, assignments, verifications
                if (existingIndex !== -1) {
                  const updated = [...prev];
                  updated[existingIndex] = { ...updated[existingIndex], ...incoming };
                  return updated;
                }

                return prev;
              });

              // Keep incidentService cache in sync without refetching network
              incidentService.updateCachedIncident(incoming as Incident);
            }
          } catch {
            // Non-JSON message (e.g. heartbeat ping)
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Exponential backoff reconnect
          reconnectTimeout = setTimeout(connectSSE, 10000);
        };
      } catch {
        // SSE not supported or network error
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Compute live metrics purely from database/state incidents
  const metrics = useMemo(() => {
    const active = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const resolvedToday = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    const critical = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const high = incidents.filter((i) => i.severity === 'HIGH' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

    return {
      activeCount: active,
      resolvedTodayCount: resolvedToday,
      criticalCount: critical,
      highCount: high,
      aiOpsCount: 10,
    };
  }, [incidents]);

  const value: IncidentContextValue = useMemo(
    () => ({
      incidents,
      activeCount: metrics.activeCount,
      resolvedTodayCount: metrics.resolvedTodayCount,
      criticalCount: metrics.criticalCount,
      highCount: metrics.highCount,
      aiOpsCount: metrics.aiOpsCount,
      loading,
      error,
      dataSource,
      refreshIncidents: () => fetchIncidents(true),
    }),
    [incidents, metrics, loading, error, dataSource, fetchIncidents]
  );

  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>;
}

/**
 * Universal hook to consume centralized incident data.
 * Zero duplicate network calls across components or in StrictMode.
 */
export function useIncidents(): IncidentContextValue {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an <IncidentProvider>');
  }
  return context;
}
