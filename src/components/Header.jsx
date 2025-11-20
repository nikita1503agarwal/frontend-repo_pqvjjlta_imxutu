import React from 'react'

function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-3">
        <img src="/flame-icon.svg" alt="logo" className="w-8 h-8" />
        <span className="text-white font-semibold text-lg">SyncWave</span>
      </div>
      <div className="text-xs text-blue-200/80">Listen together across devices</div>
    </header>
  )
}

export default Header
