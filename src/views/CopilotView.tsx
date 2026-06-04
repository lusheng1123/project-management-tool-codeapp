import { useState, useRef, useEffect } from 'react'

type ChatMessage = { role: 'user' | 'agent' | 'error'; text: string }

const LS_URL = 'copilot_env_url'
const LS_AGENT = 'copilot_agent_name'
const LS_TOKEN = 'copilot_token'

function loadEnv() {
  return {
    envUrl: localStorage.getItem(LS_URL) || '',
    agentName: localStorage.getItem(LS_AGENT) || '',
    token: localStorage.getItem(LS_TOKEN) || ''
  }
}

export function CopilotView() {
  const [envUrl, setEnvUrl] = useState('')
  const [agentName, setAgentName] = useState('')
  const [token, setToken] = useState('')
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const env = loadEnv()
    setEnvUrl(env.envUrl)
    setAgentName(env.agentName)
    setToken(env.token)
    if (env.envUrl && env.agentName) setConnected(true)
  }, [])

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const connect = () => {
    localStorage.setItem(LS_URL, envUrl.trim())
    localStorage.setItem(LS_AGENT, agentName.trim())
    localStorage.setItem(LS_TOKEN, token.trim())
    if (envUrl.trim() && agentName.trim()) {
      setConnected(true)
      setMessages([])
    }
  }

  const send = async () => {
    const msg = input.trim(); if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setSending(true)

    try {
      const baseUrl = envUrl.replace(/\/+$/, '')
      const res = await fetch(`${baseUrl}/api/data/v9.2/proactivecopilot/executeAsyncV2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'OData-Version': '4.0',
          'OData-MaxVersion': '4.0'
        },
        body: JSON.stringify({
          message: msg,
          notificationUrl: 'https://notificationurlplaceholder',
          agentName: agentName.trim()
        })
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        let hint = ''
        if (res.status === 401) hint = '(add a Bearer token or deploy to Power Apps)'
        else if (res.status === 404) hint = '(check environment URL)'
        else if (res.status === 400) hint = '(check agent name)'
        throw new Error(`${res.status} ${res.statusText}${hint ? ' ' + hint : ''}` + (errText ? ' — ' + errText.substring(0, 200) : ''))
      }

      const data = await res.json()
      const response = data?.lastResponse || data?.responses?.[0] || JSON.stringify(data)
      setMessages(prev => [...prev, { role: 'agent', text: response }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'error', text: e.message || 'Unknown error' }])
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !sending) send() }

  return (
    <div>
      <div className="dashboard-header"><h2>🤖 Copilot POC</h2></div>

      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Environment URL</label>
            <input type="text" value={envUrl} onChange={e => setEnvUrl(e.target.value)} placeholder="https://org.crm.dynamics.com" style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Agent Name</label>
            <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="cr3e1_myAgent" style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Bearer Token (optional)</label>
            <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="eyJ0eXAiOi..." style={{ width: '100%', padding: '8px 10px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
          </div>
          <button className="btn btn-primary" onClick={connect} style={{ whiteSpace: 'nowrap' }}>Connect</button>
        </div>
      </div>

      {!connected && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Enter your environment URL and agent name, then click <strong>Connect</strong>.</p>
          <p style={{ fontSize: '0.85rem' }}>In DEV mode you will also need a Bearer token. Deployed to Power Apps, the platform handles auth automatically.</p>
        </div>
      )}

      {connected && (
        <>
          <div className="card" style={{ padding: '16px', minHeight: '300px', maxHeight: '500px', overflowY: 'auto', marginBottom: '12px', background: 'var(--bg)' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Connected to <strong>{agentName.trim()}</strong>. Type a message to start.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                marginBottom: '10px', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                background: m.role === 'user' ? 'var(--primary-bg)' : m.role === 'error' ? 'var(--red-bg)' : 'var(--surface)',
                border: `1px solid ${m.role === 'user' ? 'var(--primary-light)' : m.role === 'error' ? 'var(--red)' : 'var(--border)'}`,
                fontSize: '0.85rem', lineHeight: 1.5
              }}>
                <span style={{ fontWeight: 600, marginRight: '8px', color: m.role === 'user' ? 'var(--primary)' : m.role === 'error' ? 'var(--red)' : 'var(--green)' }}>
                  {m.role === 'user' ? 'You:' : m.role === 'error' ? 'Error:' : '🤖'}
                </span>
                {m.text}
              </div>
            ))}
            <div ref={chatEnd} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              disabled={sending}
              style={{ flex: 1, padding: '10px 12px', fontSize: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            />
            <button className="btn btn-primary" onClick={send} disabled={sending || !input.trim()}>
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
