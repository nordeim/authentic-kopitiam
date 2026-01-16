import { PolaroidGallery, type PolaroidPhoto } from '@/components/animations/polaroid-gallery';
import { RetroButton } from '@/components/ui/retro-button';
import { AnimatedSection } from '@/components/animations/animated-section';

const POLAROID_PHOTOS: PolaroidPhoto[] = [
  {
    id: '1',
    caption: 'Founders in 1973',
    imageUrl: undefined,
    rotationOffset: -2,
  },
  {
    id: '2',
    caption: 'First Kopitiam Opening',
    imageUrl: undefined,
    rotationOffset: 3,
  },
  {
    id: '3',
    caption: '50 Years of Heritage',
    imageUrl: undefined,
    rotationOffset: -1,
  },
  {
    id: '4',
    caption: 'Morning Brew Legacy',
    imageUrl: undefined,
    rotationOffset: 2,
  },
];

export default function HeritagePage() {
  return (
    <section id="heritage" className="heritage">
      <div className="container">
        <AnimatedSection delay={0} className="heritage__grid">
          <div className="heritage__content">
            <div className="heritage__intro">
              <span className="heritage__dropcap">S</span>
              ince 1973, Morning Brew Collective has been weaving Singapore's kopitiam heritage into every cup of kopi. Our founders, Mr. and Mrs. Tan, started with a simple dream: to bring the warmth of traditional coffee culture to the heart of Singapore's bustling neighborhoods. Today, five decades later, we continue their legacy with the same passion, the same recipes, and the same commitment to community that made the first Morning Brew a gathering place for generations.
            </div>

            <div className="heritage__quote">
              <blockquote>
                &quot;A kopitiam is more than a coffee shop. It is where stories are shared, friendships are forged, and memories are made over a humble cup of kopi.&quot;
              </blockquote>
              <footer>
                — Mr. Tan, Co-Founder (1973-1998)
              </footer>
            </div>

            <div className="heritage__values">
              <div className="value">
                <span className="value__icon">☕</span>
                <h4 className="value__title">Heritage</h4>
                <p className="value__text">
                  Preserving 50 years of tradition
                </p>
              </div>
              <div className="value">
                <span className="value__icon">🤝</span>
                <h4 className="value__title">Community</h4>
                <p className="value__text">
                  Connecting generations through shared moments
                </p>
              </div>
              <div className="value">
                <span className="value__icon">✨</span>
                <h4 className="value__title">Quality</h4>
                <p className="value__text">
                  Crafted with love and the finest beans
                </p>
              </div>
            </div>

            <div className="heritage__cta">
              <h3>Share Our Heritage</h3>
              <p>
                Join our story and become part of the Morning Brew Collective family. Every cup you enjoy connects you to five decades of Singaporean kopitiam tradition.
              </p>
              <RetroButton variant="primary" href="#order">
                Join Our Story
              </RetroButton>
            </div>
          </div>

          <AnimatedSection delay={400}>
            <PolaroidGallery photos={POLAROID_PHOTOS} />
          </AnimatedSection>
        </AnimatedSection>
      </div>
    </section>
  );
}
