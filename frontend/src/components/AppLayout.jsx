import AnimatedBackground from './AnimatedBackground';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  return (
    <>
      <AnimatedBackground />
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
