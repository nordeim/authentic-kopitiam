import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface ContactItem {
  label: string;
  value: string;
  icon: string;
}

interface SocialLink {
  platform: string;
  href: string;
  label: string;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Menu', href: '#menu' },
  { label: 'Our Story', href: '#heritage' },
  { label: 'Locations', href: '#locations' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const CONTACT_ITEMS: ContactItem[] = [
  { label: 'Address', value: '18 Tanjong Pagar Road, Singapore 088443', icon: '📍' },
  { label: 'Phone', value: '+65 6123 4567', icon: '📞' },
  { label: 'Email', value: 'hello@morningbrew.sg', icon: '✉️' },
];

const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'Facebook', href: 'https://facebook.com/morningbrewsg', label: 'Follow us on Facebook' },
  { platform: 'Instagram', href: 'https://instagram.com/morningbrewsg', label: 'Follow us on Instagram' },
  { platform: 'TikTok', href: 'https://tiktok.com/@morningbrewsg', label: 'Follow us on TikTok' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__border-top" />
      
      <div className="container">
        <div className="footer__grid">
          <div className="footer__section footer__section--about">
            <div className="logo">
              <span className="logo__main">Morning Brew</span>
              <span className="logo__sub">Collective</span>
            </div>
            <p className="footer__about-text">
              Bringing Singapore's kopitiam heritage to the digital age. Since 1973, we've been crafting the perfect cup of kopi with love, tradition, and community.
            </p>
          </div>

          <div className="footer__section footer__section--links">
            <h3 className="footer__heading">Quick Links</h3>
            <ul className="footer__links">
              {FOOTER_LINKS.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="footer__link">
                    <span className="footer__link__chevron">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__section footer__section--contact">
            <h3 className="footer__heading">Contact Us</h3>
            <ul className="footer__contact">
              {CONTACT_ITEMS.map((item, index) => (
                <li key={index} className="contact-item">
                  <span className="contact-item__icon">{item.icon}</span>
                  <div>
                    <span className="contact-item__label">{item.label}</span>
                    <span className="contact-item__value">{item.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__section footer__section--social">
            <h3 className="footer__heading">Follow Us</h3>
            <div className="footer__social">
              {SOCIAL_LINKS.map(link => (
                <a
                  key={link.platform}
                  href={link.href}
                  className="footer__social-link"
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform.substring(0, 2)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          © 2025 Morning Brew Collective. All rights reserved.
        </p>
        <div className="footer__badges">
          <span className="footer__badge">GST 9%</span>
          <span className="footer__badge">InvoiceNow</span>
          <span className="footer__badge">PDPA Compliant</span>
        </div>
      </div>
    </footer>
  );
}
