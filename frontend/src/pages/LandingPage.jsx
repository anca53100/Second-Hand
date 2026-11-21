import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import ItemGrid from '../components/ItemGrid.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Footer from '../components/Footer.jsx';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ItemGrid />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
