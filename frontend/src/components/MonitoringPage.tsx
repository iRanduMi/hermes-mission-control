export default function MonitoringPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-[590] text-text-primary mb-6">Monitoring</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {['HomeLab Status', 'Service Uptime', 'Resource Usage', 'Docker Containers'].map(name => (
          <div key={name} className="rounded-lg border border-panel-border bg-panel p-6 min-h-[120px] flex flex-col items-center justify-center">
            <span className="text-text-secondary font-[510]">{name}</span>
            <span className="mt-2 px-2 py-0.5 text-xs rounded bg-panel-hover text-text-muted border border-panel-border">Coming soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
