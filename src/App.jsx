import Header from './components/Header'
import RoomControls from './components/RoomControls'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

      <div className="relative min-h-screen px-6">
        <div className="max-w-3xl mx-auto">
          <Header />

          <main className="mt-6 grid gap-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">SyncWave</h1>
              <p className="text-blue-200 mt-3">Create a room, share the code, and listen together across devices.</p>
            </div>
            <RoomControls />

            <p className="text-center text-blue-300/60 text-xs pb-12">Use a direct audio link (MP3/stream). Playback is synchronized by polling; perfect for quick shared listening.</p>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
