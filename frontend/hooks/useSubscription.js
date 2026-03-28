'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      setLoading(true);
      const data = await api.getSubscriptionStatus();
      setSubscription(data.subscription);
      setIsActive(data.is_active);
    } catch {
      setSubscription(null);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    const data = await api.subscribe();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    }
    return data;
  }

  async function manageSubscription() {
    const data = await api.getPortalUrl();
    if (data.portal_url) {
      window.location.href = data.portal_url;
    }
    return data;
  }

  return { subscription, isActive, loading, subscribe, manageSubscription, fetchStatus };
}

export default useSubscription;
