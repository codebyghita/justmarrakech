import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useTranslation } from 'react-i18next';

const Home = lazy(() => import('./pages/Home'));
const Activities = lazy(() => import('./pages/Activities'));
const Detail = lazy(() => import('./pages/Detail'));
const Excursions = lazy(() => import('./pages/Excursions'));
const SurMesure = lazy(() => import('./pages/SurMesure'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));

const Loader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

function App() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-background)]" dir={isRtl ? 'rtl' : 'ltr'}>
        <Navbar />
        <main className="pt-20 md:pt-24 pb-12">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/:categorySlug" element={<Activities />} />
              <Route path="/activities/:categorySlug/:activitySlug" element={<Detail />} />
              <Route path="/excursions" element={<Excursions />} />
              <Route path="/excursions/:activitySlug" element={<Detail />} />
              <Route path="/sur-mesure" element={<SurMesure />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/detail/:type/:id" element={<Detail />} />
              <Route path="/admin/*" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
