import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import AuthGuard from "../../components/auth/AuthGuard";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
