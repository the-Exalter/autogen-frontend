import { useState, useRef } from 'react';
import { streamAiSearch } from '../services/api';

export default function useVehicleStream() {
  const [streamingText, setStreamingText] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const startStream = (query) => {
    // Cancel any in-flight stream
    if (abortRef.current) abortRef.current();

    setStreamingText('');
    setVehicle(null);
    setError(null);
    setIsStreaming(true);

    abortRef.current = streamAiSearch(query, {
      onDelta: (text) => setStreamingText((prev) => prev + text),
      onDone: (v) => {
        setVehicle(v);
        setIsStreaming(false);
      },
      onError: (msg) => {
        setError(msg || 'Something went wrong.');
        setIsStreaming(false);
      },
    });
  };

  const cancelStream = () => {
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }
    setIsStreaming(false);
  };

  return { streamingText, vehicle, isStreaming, error, startStream, cancelStream };
}