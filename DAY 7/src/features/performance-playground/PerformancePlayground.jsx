import { useCallback, useMemo, useState } from 'react'
import PlaygroundControls from './components/PlaygroundControls.jsx'
import PerformanceMetricsPanel from './components/PerformanceMetricsPanel.jsx'
import ReactMemoDemo from './components/demos/ReactMemoDemo.jsx'
import UseMemoDemo from './components/demos/UseMemoDemo.jsx'
import UseCallbackDemo from './components/demos/UseCallbackDemo.jsx'
import VirtualizationDemo from './components/demos/VirtualizationDemo.jsx'
import DebounceDemo from './components/demos/DebounceDemo.jsx'
import CodeSplittingDemo from './components/demos/CodeSplittingDemo.jsx'
import WebWorkerDemo from './components/demos/WebWorkerDemo.jsx'
import useFpsMeter from './hooks/useFpsMeter.jsx'
import useStressRunner from './hooks/useStressRunner.jsx'
import './performance-playground.css'

function aggregatePaneMetrics(demoMetrics, pane) {
  const entries = Object.values(demoMetrics)
    .map((metric) => metric[pane])
    .filter(Boolean)

  if (entries.length === 0) {
    return {
      renders: 0,
      avgTimeMs: 0,
      cpuPercent: 0,
    }
  }

  const totalRenders = entries.reduce((sum, entry) => sum + entry.renders, 0)
  const totalTime = entries.reduce((sum, entry) => sum + entry.timeMs, 0)
  const avgTimeMs = Number((totalTime / entries.length).toFixed(2))
  const cpuPercent = Math.min(95, Math.max(5, Math.round(avgTimeMs * 1.2)))

  return {
    renders: totalRenders,
    avgTimeMs,
    cpuPercent,
  }
}

function PerformancePlayground() {
  const [demoMetrics, setDemoMetrics] = useState({})
  const [highlightRenders, setHighlightRenders] = useState(true)
  const [cpuThrottleEnabled, setCpuThrottleEnabled] = useState(false)

  const fps = useFpsMeter()
  const {
    stressSignal,
    runStressTest,
    startStressTest,
    stopStressTest,
    isStressRunning,
  } = useStressRunner()

  const onMetrics = useCallback((demoKey, pane, metrics) => {
    setDemoMetrics((current) => ({
      ...current,
      [demoKey]: {
        ...(current[demoKey] ?? {}),
        [pane]: metrics,
      },
    }))
  }, [])

  const unoptimizedMetrics = useMemo(() => {
    const aggregated = aggregatePaneMetrics(demoMetrics, 'unoptimized')
    return {
      ...aggregated,
      fps: cpuThrottleEnabled ? Math.max(5, fps - 20) : Math.max(8, fps - 10),
    }
  }, [cpuThrottleEnabled, demoMetrics, fps])

  const optimizedMetrics = useMemo(() => {
    const aggregated = aggregatePaneMetrics(demoMetrics, 'optimized')
    return {
      ...aggregated,
      fps: cpuThrottleEnabled ? Math.max(5, fps - 10) : fps,
    }
  }, [cpuThrottleEnabled, demoMetrics, fps])

  return (
    <div className="performance-playground">
      <section className="panel playground-panel">
        <h2>Performance Optimization Playground</h2>
        <p className="exercise-objective">
          Side-by-side comparison of unoptimized and optimized React patterns.
        </p>
      </section>

      <PlaygroundControls
        highlightRenders={highlightRenders}
        onToggleHighlightRenders={() =>
          setHighlightRenders((current) => !current)
        }
        cpuThrottleEnabled={cpuThrottleEnabled}
        onToggleCpuThrottle={() =>
          setCpuThrottleEnabled((current) => !current)
        }
        onRunStressTest={runStressTest}
        onStartStressTest={startStressTest}
        onStopStressTest={stopStressTest}
        isStressRunning={isStressRunning}
      />

      <PerformanceMetricsPanel
        unoptimizedMetrics={unoptimizedMetrics}
        optimizedMetrics={optimizedMetrics}
      />

      <ReactMemoDemo
        stressSignal={stressSignal}
        onMetrics={onMetrics}
        highlightRenders={highlightRenders}
      />
      <UseMemoDemo
        stressSignal={stressSignal}
        onMetrics={onMetrics}
        cpuThrottleEnabled={cpuThrottleEnabled}
      />
      <UseCallbackDemo
        stressSignal={stressSignal}
        onMetrics={onMetrics}
        highlightRenders={highlightRenders}
      />
      <VirtualizationDemo stressSignal={stressSignal} onMetrics={onMetrics} />
      <DebounceDemo stressSignal={stressSignal} onMetrics={onMetrics} />
      <CodeSplittingDemo stressSignal={stressSignal} onMetrics={onMetrics} />
      <WebWorkerDemo stressSignal={stressSignal} onMetrics={onMetrics} />
    </div>
  )
}

export default PerformancePlayground
