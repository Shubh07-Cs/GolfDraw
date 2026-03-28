'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';

export function useScores() {
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchScores() {
    try {
      setLoading(true);
      const data = await api.getScores();
      setScores(data.scores);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addScore(score, course_name, played_at) {
    const data = await api.addScore(score, course_name, played_at);
    setScores(data.scores);
    return data;
  }

  async function deleteScore(id) {
    await api.deleteScore(id);
    await fetchScores();
  }

  useEffect(() => {
    fetchScores();
  }, []);

  return { scores, stats, loading, error, addScore, deleteScore, fetchScores };
}

export default useScores;
