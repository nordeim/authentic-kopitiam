'use client';

import { RetroButton } from '@/components/ui/retro-button';
import { AnimatedSection } from '@/components/ui/animated-section';
import { MapMarker } from '@/components/animations/map-marker';

interface Location {
  id: string;
  name: string;
  badge?: string;
  address: string;
  hours: string;
  features: string[];
  imageUrl?: string;
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Tanjong Pagar',
    badge: 'Flagship',
    address: '18 Tanjong Pagar Road, Singapore 088443',
    hours: 'Daily 7:00 AM - 10:00 PM',
    features: ['Drive-thru', 'WiFi', 'Outdoor Seating'],
  },
  {
    id: '2',
    name: 'Bukit Merah',
    badge: 'New',
    address: '122 Bukit Merah Lane, Singapore 150122',
    hours: 'Daily 7:00 AM - 10:00 PM',
    features: ['WiFi', 'Parking', 'Meeting Room'],
  },
  {
    id: '3',
    name: 'Toa Payoh',
    badge: 'Legacy',
    address: '450 Lorong 1 Toa Payoh, Singapore 319754',
    hours: 'Daily 7:00 AM - 10:00 PM',
    features: ['Heritage Décor', 'WiFi', 'Drive-thru'],
  },
];

export default function LocationsPage() {
  return (
    <section id="locations" className="locations">
      <div className="container">
        <AnimatedSection delay={0} className="section-header">
          <h2 className="section-header__title">Visit Our Kopitiams</h2>
          <p className="section-header__subtitle">
            Three locations across Singapore, same heritage taste
          </p>
          <div className="section-header__decoration">
            <span className="section-header__line" />
            <span className="section-header__icon">📍</span>
            <span className="section-header__line" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="locations__grid">
            {MOCK_LOCATIONS.map(location => (
              <div key={location.id} className="location-card">
                <div className="location-card__header">
                  <h3 className="location-card__title">{location.name}</h3>
                  {location.badge && (
                    <span className="location-card__badge">
                      {location.badge}
                    </span>
                  )}
                </div>
                <div className="location-card__image">
                  <span style={{ fontSize: '3rem' }}>
                    {location.name === 'Tanjong Pagar' ? '☕' :
                     location.name === 'Bukit Merah' ? '🏢' :
                     location.name === 'Toa Payoh' ? '🏛️' : '☕'}
                  </span>
                </div>
                <div className="location-card__details">
                  <p className="location-card__address">{location.address}</p>
                  <p className="location-card__hours">{location.hours}</p>
                  <div className="location-card__features">
                    {location.features.map(feature => (
                      <span key={feature} className="feature">
                        <span className="feature__bullet">•</span>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="location-card__actions">
                  <RetroButton className="location-card__link">
                    Get Directions
                  </RetroButton>
                  <RetroButton variant="outline" className="location-card__link location-card__link--secondary">
                    View Menu
                  </RetroButton>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={600} className="locations__map">
          <div className="locations__map-title">
            Interactive Map Coming Soon
          </div>
          <p className="locations__map-text">
            Our map integration is in development. For now, use Google Maps for directions.
          </p>
          <div className="locations__map-markers">
            <MapMarker delay={0} />
            <MapMarker delay={0.3} />
            <MapMarker delay={0.6} />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={800} className="locations__footer">
          <p>Planning to open more locations. Check back soon for updates.</p>
        </AnimatedSection>
      </div>
    </section>
  );
}
