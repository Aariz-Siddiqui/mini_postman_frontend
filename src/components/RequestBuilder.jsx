import { useState } from 'react';

export default function RequestBuilder() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState('');
  const [statusCode, setStatusCode] = useState(null);
  const [error, setError] = useState('');

  const isLoggedIn = !!localStorage.getItem('token');

  const sendRequest = async () => {
    setError('');
    setResponse('');
    setStatusCode(null);

    let parsedHeaders = {};
    let parsedBody = {};

    try {
      parsedHeaders = headers.trim() ? JSON.parse(headers) : {};
      parsedBody = body.trim() ? JSON.parse(body) : {};
    } catch {
      setError('Invalid JSON in headers or body');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      parsedHeaders.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch('https://mini-postman-be.vercel.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          method,
          headers: parsedHeaders,
          body: parsedBody
        })
      });

      const data = await res.json();
      setStatusCode(data.status);

      try {
        if (typeof data.data === 'string') {
          const parsed = JSON.parse(data.data);
          if (parsed.token) {
            localStorage.setItem('token', parsed.token);
          }
        }
      } catch {}

      setResponse(JSON.stringify(data, null, 2));
    } catch {
      setError('Failed to send request');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Mini Postman</h2>
            <p style={styles.subtitle}>
              Lightweight API testing tool with JWT support
            </p>
          </div>
          <span style={{ color: isLoggedIn ? '#22c55e' : '#ef4444' }}>
            ● {isLoggedIn ? 'Logged in' : 'Not logged in'}
          </span>
        </div>

        {/* URL Row */}
        <div style={styles.row}>
          <select
            style={{
              ...styles.method,
              background: methodColors[method]
            }}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>

          <input
            style={styles.url}
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <label style={styles.label}>Headers (JSON)</label>
        <textarea
          style={styles.textarea}
          rows={4}
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
        />

        <label style={styles.label}>Body (JSON)</label>
        <textarea
          style={styles.textarea}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <button style={styles.button} onClick={sendRequest}>
          Send Request
        </button>

        {error && <p style={styles.error}>{error}</p>}

        {response && (
          <>
            <div style={styles.responseHeader}>
              <span style={styles.label}>Response</span>
              {statusCode && (
                <span style={styles.statusBadge(statusCode)}>
                  {statusCode}
                </span>
              )}
            </div>
            <pre style={styles.response}>{response}</pre>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const methodColors = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444'
};

const styles = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #020617, #0f172a)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '1200px',
    background: '#ffffff',
    borderRadius: '18px',
    padding: '32px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.35)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px'
  },
  title: {
    margin: 0
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748b'
  },
  row: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  method: {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    color: '#fff',
    fontWeight: '700'
  },
  url: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #cbd5f5'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '16px',
    display: 'block'
  },
  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #cbd5f5',
    fontFamily: 'monospace',
    marginTop: '6px'
  },
  button: {
    marginTop: '24px',
    padding: '16px',
    width: '100%',
    borderRadius: '12px',
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer'
  },
  responseHeader: {
    marginTop: '26px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  response: {
    marginTop: '10px',
    background: '#020617',
    color: '#e5e7eb',
    padding: '18px',
    borderRadius: '12px',
    maxHeight: '360px',
    overflow: 'auto',
    fontSize: '14px'
  },
  statusBadge: (code) => ({
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
    background:
      code >= 200 && code < 300
        ? '#22c55e'
        : code >= 400
        ? '#ef4444'
        : '#f59e0b',
    color: '#fff'
  }),
  error: {
    color: '#ef4444',
    marginTop: '12px'
  }
};
