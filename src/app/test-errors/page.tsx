'use client';

import { useState } from 'react';

export default function TestErrorsPage() {
  const [loading, setLoading] = useState(false);

  const triggerConsoleWarn = () => {
    console.warn('⚠️ Test Warning: This is a test warning message for HumanBehavior tracking');
  };

  const triggerConsoleError = () => {
    console.error('❌ Test Error: This is a test error message for HumanBehavior tracking');
  };

  const triggerConsoleErrorWithStack = () => {
    try {
      throw new Error('Test error with stack trace for HumanBehavior tracking');
    } catch (error) {
      console.error('Caught test error:', error);
    }
  };

  const triggerNetworkError404 = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/nonexistent-endpoint-404');
      if (!response.ok) {
        console.error('Got 404 response:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerNetworkError500 = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-error-500');
      if (!response.ok) {
        console.error('Got 500 response:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerCorsError = async () => {
    setLoading(true);
    try {
      // This will likely trigger a CORS error
      await fetch('https://api.example.com/test-cors-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'data' }),
      });
    } catch (error) {
      console.error('CORS error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerTimeoutError = async () => {
    setLoading(true);
    try {
      // Create a request that will timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100); // 100ms timeout
      
      await fetch('https://httpstat.us/200?sleep=5000', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Request timeout error:', error);
      } else {
        console.error('Network error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerBlockedRequest = async () => {
    setLoading(true);
    try {
      // Try to fetch from a domain that might be blocked by ad blockers
      await fetch('https://doubleclick.net/test-blocked');
    } catch (error) {
      console.error('Blocked request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerLongLoadingRequest = async () => {
    setLoading(true);
    try {
      console.log('⏳ Starting long-loading request test (will take ~12 seconds)...');
      const startTime = Date.now();
      const response = await fetch('/api/test-long-loading');
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Long-loading request completed after ${duration}ms:`, data);
        alert(`Request completed after ${duration}ms. Check the logs viewer to see if it was marked as long-loading (>10 seconds).`);
      } else {
        console.error('Long-loading request failed:', response.status);
      }
    } catch (error) {
      console.error('Long-loading request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerStuckRequest = async () => {
    setLoading(true);
    try {
      console.log('⏳ Starting stuck request test (will hang indefinitely, but should be marked as long-loading after 10 seconds)...');
      const startTime = Date.now();
      
      // Set a client-side timeout to abort after 15 seconds so the UI doesn't hang forever
      const controller = new AbortController();
      const abortTimeout = setTimeout(() => {
        controller.abort();
        const duration = Date.now() - startTime;
        console.log(`⏱️ Client-side abort after ${duration}ms (request was stuck)`);
        alert(`Request was stuck and aborted after ${duration}ms. Check the logs viewer - it should have been marked as long-loading after 10 seconds, even though it never completed.`);
        setLoading(false);
      }, 15000);
      
      try {
        const response = await fetch('/api/test-stuck-request', {
          signal: controller.signal
        });
        clearTimeout(abortTimeout);
        // This should never happen since the endpoint hangs
        console.log('Unexpected: Request completed:', response);
      } catch (error: any) {
        clearTimeout(abortTimeout);
        if (error.name === 'AbortError') {
          const duration = Date.now() - startTime;
          console.log(`✅ Request aborted after ${duration}ms (expected for stuck request)`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Stuck request error:', error);
      setLoading(false);
    }
  };

  const triggerMultipleErrors = () => {
    // Trigger multiple errors at once
    console.warn('Multiple errors test - Warning 1');
    console.error('Multiple errors test - Error 1');
    console.warn('Multiple errors test - Warning 2');
    
    // Trigger network errors
    fetch('/api/nonexistent-1').catch(() => {});
    fetch('/api/nonexistent-2').catch(() => {});
    fetch('/api/nonexistent-3').catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HumanBehavior Error Testing
          </h1>
          <p className="text-gray-600 mb-8">
            Use these buttons to test console log and network error tracking.
            Check the logs viewer at <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5050/logs-viewer.html</code>
          </p>

          <div className="space-y-6">
            {/* Console Logs Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Console Logs (Warn/Error)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={triggerConsoleWarn}
                  className="px-4 py-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-medium transition-colors"
                >
                  Trigger Console Warning
                </button>
                <button
                  onClick={triggerConsoleError}
                  className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
                >
                  Trigger Console Error
                </button>
                <button
                  onClick={triggerConsoleErrorWithStack}
                  className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
                >
                  Error with Stack Trace
                </button>
              </div>
            </div>

            {/* Network Errors Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Network Errors & Long Loading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={triggerNetworkError404}
                  disabled={loading}
                  className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger 404 Error'}
                </button>
                <button
                  onClick={triggerNetworkError500}
                  disabled={loading}
                  className="px-4 py-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger 500 Error'}
                </button>
                <button
                  onClick={triggerCorsError}
                  disabled={loading}
                  className="px-4 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger CORS Error'}
                </button>
                <button
                  onClick={triggerTimeoutError}
                  disabled={loading}
                  className="px-4 py-3 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger Timeout Error'}
                </button>
                <button
                  onClick={triggerBlockedRequest}
                  disabled={loading}
                  className="px-4 py-3 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger Blocked Request'}
                </button>
                <button
                  onClick={triggerLongLoadingRequest}
                  disabled={loading}
                  className="px-4 py-3 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger Long Loading (>10s)'}
                </button>
                <button
                  onClick={triggerStuckRequest}
                  disabled={loading}
                  className="px-4 py-3 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Trigger Stuck Request (Hangs)'}
                </button>
              </div>
            </div>

            {/* Multiple Errors */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Batch Testing
              </h2>
              <button
                onClick={triggerMultipleErrors}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                Trigger Multiple Errors at Once
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                <li>Make sure test-ingestion server is running on port 5050</li>
                <li>Click any button above to trigger errors</li>
                <li>Open the logs viewer: <code className="bg-blue-100 px-1 rounded">http://localhost:5050/logs-viewer.html</code></li>
                <li>Select your session to see the logs and network errors</li>
                <li>Check both "Console Logs" and "Network Errors" tabs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

