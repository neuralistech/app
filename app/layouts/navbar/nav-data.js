import config from '~/config.json';

export const navLinks = [
  {
    label: 'Servicios',
    pathname: '/#project-1',
  },
  {
    label: 'Nosotros',
    pathname: '/#details',
  },
  {
    label: 'Contacto',
    pathname: '/contact',
  },
  {
    label: 'Login',
    pathname: config.appUrl,
    isExternal: true,
  },
];

export const socialLinks = [
  {
    label: 'LinkedIn',
    url: `https://www.linkedin.com/company/${config.linkedin}`,
    icon: 'linkedin',
  },
  {
    label: 'Instagram',
    url: `https://www.instagram.com/${config.instagram}`,
    icon: 'instagram',
  },
  {
    label: 'Facebook',
    url: `https://www.facebook.com/${config.facebook}`,
    icon: 'facebook',
  },
];
