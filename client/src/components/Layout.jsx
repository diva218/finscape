export default function Layout({ children }) {
  return (
    <main className="app-shell">
      <div className="decor decor-one" aria-hidden="true" />
      <div className="decor decor-two" aria-hidden="true" />
      <header className="hero">
        <p className="kicker">Future-First Finance</p>
        <h1>
          Financial Decision <span>Simulator</span>
        </h1>
        <p className="subtitle">
          Test money moves before real life tests you. Simulate income, expenses, and bold choices.
        </p>
        <div className="hero-tags">
          <span>cute</span>
          <span>sleek</span>
          <span>retro</span>
        </div>
      </header>
      {children}
    </main>
  );
}
