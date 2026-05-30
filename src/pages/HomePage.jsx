import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Hero from '../components/home/Hero';
import Program from '../components/home/Program';
import Gallery from '../components/home/Gallery';
import DressCode from '../components/home/DressCode';
import RSVP from '../components/home/RSVP';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Program />
        <Gallery />
        <DressCode />
        <RSVP />
      </main>
      <Footer />
    </div>
  );
}
