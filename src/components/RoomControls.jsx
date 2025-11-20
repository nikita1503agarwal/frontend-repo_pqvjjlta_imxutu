import React, { useEffect, useRef, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function RoomControls() {
  const [code, setCode] = useState('')
  const [joined, setJoined] = useState(false)
  const [room, setRoom] = useState(null)
  const [trackUrl, setTrackUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const audioRef = useRef(null)

  // Poll room every 1.5s for state changes
  useEffect(() => {
    if (!joined || !code) return
    const id = setInterval(async () => {
      try {
        const r = await fetch(`${BACKEND}/api/rooms/${code}`)
        if (r.ok) {
          const data = await r.json()
          setRoom(data)
          if (data.track_url && audioRef.current?.src !== data.track_url) {
            audioRef.current.src = data.track_url
          }
          if (typeof data.position === 'number') {
            // If drift > 0.75s, correct
            const drift = Math.abs((audioRef.current?.currentTime || 0) - data.position)
            if (drift > 0.75) {
              audioRef.current.currentTime = data.position
            }
          }
          if (typeof data.is_playing === 'boolean') {
            if (data.is_playing) {
              audioRef.current.play().catch(() => {})
            } else {
              audioRef.current.pause()
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }, 1500)
    return () => clearInterval(id)
  }, [joined, code])

  const createRoom = async () => {
    if (!code) return
    setBusy(true)
    try {
      const res = await fetch(`${BACKEND}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, track_url: trackUrl || null })
      })
      if (!res.ok) throw new Error('Failed')
      await joinRoom()
    } catch (e) {
      // If exists, just join
      await joinRoom()
    } finally {
      setBusy(false)
    }
  }

  const joinRoom = async () => {
    setBusy(true)
    try {
      const res = await fetch(`${BACKEND}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      if (!res.ok) throw new Error('join failed')
      const data = await res.json()
      setRoom(data)
      setJoined(true)
      setTrackUrl(data.track_url || '')
      if (data.track_url) {
        audioRef.current.src = data.track_url
      }
    } catch (e) {
      // noop
    } finally {
      setBusy(false)
    }
  }

  const pushState = async (patch) => {
    if (!code) return
    await fetch(`${BACKEND}/api/rooms/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...patch })
    })
  }

  const onPlay = async () => {
    await pushState({ is_playing: true, position: audioRef.current.currentTime })
  }
  const onPause = async () => {
    await pushState({ is_playing: false, position: audioRef.current.currentTime })
  }
  const onSeek = async () => {
    await pushState({ position: audioRef.current.currentTime })
  }
  const onChangeTrack = async () => {
    if (!trackUrl) return
    audioRef.current.src = trackUrl
    await pushState({ track_url: trackUrl, position: 0, is_playing: true })
  }

  if (!joined) {
    return (
      <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-blue-200 text-sm mb-2">Room Code</label>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g. WAVE1" className="w-full bg-slate-900/60 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-blue-200 text-sm mb-2">Audio URL</label>
            <input value={trackUrl} onChange={e=>setTrackUrl(e.target.value)} placeholder="Paste an MP3/stream URL" className="w-full bg-slate-900/60 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
          </div>
          <button onClick={createRoom} disabled={busy || !code} className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg">Create or Join</button>
          <button onClick={joinRoom} disabled={busy || !code} className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg">Join</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Room</p>
            <h3 className="text-white text-2xl font-semibold">{code}</h3>
          </div>
          <span className="text-xs text-blue-300/70">Share the code to sync</span>
        </div>
        <div className="mt-6 grid gap-4">
          <div>
            <label className="block text-blue-200 text-sm mb-2">Audio URL</label>
            <input value={trackUrl} onChange={e=>setTrackUrl(e.target.value)} placeholder="Paste an MP3/stream URL" className="w-full bg-slate-900/60 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
            <button onClick={onChangeTrack} className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Load & Play</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onPlay} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg">Play</button>
            <button onClick={onPause} className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 px-4 rounded-lg">Pause</button>
            <button onClick={() => { audioRef.current.currentTime = 0; onSeek() }} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg">Restart</button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} onPlay={onPlay} onPause={onPause} onSeeked={onSeek} className="w-full" controls />
    </div>
  )
}

export default RoomControls
