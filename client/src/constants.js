// Datos compartidos del sitio: navegación y contacto.
// Si cambia un link o un teléfono, se cambia acá y se actualiza en Navbar, Footer y SecForm.

// Links de navegación (Navbar y Footer). `end` hace que "Inicio" solo quede activo en "/".
export const LINKS_NAVEGACION = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/fabricacion', label: 'Fabricación' },
  { to: '/reparacion', label: 'Reparación' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/planificacion', label: 'Cotización' },
];

export const MAIL_CONTACTO = 'walterdcorrea@gmail.com';

export const DIRECCION = 'Martín Rodríguez 2875 · (1644) Victoria, Buenos Aires';

export const TELEFONOS = [
  { nombre: 'Walter Correa', tel: '11-2154-4111' },
  { nombre: 'Gustavo Ledesma', tel: '11-5806-9162' },
  { nombre: 'Claudio Ledesma', tel: '11-2756-5557' },
];

// Arma el link de WhatsApp a partir de un teléfono de AMBA con formato "11-XXXX-XXXX".
// `texto` (opcional) es el mensaje que aparece ya escrito en el chat.
// Ej: '11-2154-4111' -> 'https://wa.me/5491121544111'
/** @param {string} tel @param {string} [texto] */
export const linkWhatsApp = (tel, texto) => {
  const link = `https://wa.me/549${tel.replace(/\D/g, '')}`;
  return texto ? `${link}?text=${encodeURIComponent(texto)}` : link;
};

// Arma el link para redactar un mail a CLL desde Gmail web, con asunto y cuerpo (opcional).
/** @param {string} asunto @param {string} [cuerpo] */
export const linkGmail = (asunto, cuerpo) => {
  let link = `https://mail.google.com/mail/?view=cm&fs=1&to=${MAIL_CONTACTO}&su=${encodeURIComponent(asunto)}`;
  if (cuerpo) link += `&body=${encodeURIComponent(cuerpo)}`;
  return link;
};
