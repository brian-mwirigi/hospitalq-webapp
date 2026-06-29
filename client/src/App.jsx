import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Badge } from './components/ui/Badge'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-art">
          <img src={heroImg} className="base" width="170" height="179" alt="HospitalQ hero" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div className="hero-copy">
          <h1>HospitalQ design system</h1>
          <p>Foundational tokens, Tailwind utilities, and reusable UI controls for HospitalQ.</p>
          <div className="hero-badges">
            <Badge status="waiting">Waiting</Badge>
            <Badge status="in-progress">In Progress</Badge>
            <Badge status="done">Done</Badge>
            <Badge status="no-show">No-Show</Badge>
            <Badge status="skipped">Skipped</Badge>
          </div>
          <div className="hero-actions">
            <Button onClick={() => setCount((value) => value + 1)}>Clicked {count} times</Button>
            <Button variant="ghost">View tokens</Button>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <div>
          <h2>Check in patient</h2>
          <Input label="Patient name" placeholder="Enter name" />
          <Input label="Room number" placeholder="e.g. 207" className="mt-4" />
        </div>
        <div className="info-card">
          <h3>Ready for next step</h3>
          <p>All UI elements use the HospitalQ palette and spacing scale. No raw hex values in components.</p>
        </div>
      </section>
    </main>
  )
}

export default App
