const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://www.facebook.com/AllianzAustralia/', icon: 'facebook' },
  { name: 'X', url: 'https://x.com/allianz_au', icon: 'x' },
  { name: 'LinkedIn', url: 'https://au.linkedin.com/company/allianz-australia-limited', icon: 'linkedin' },
  { name: 'YouTube', url: 'https://www.youtube.com/c/AllianzAustraliaInsurance', icon: 'youtube' },
  { name: 'Instagram', url: 'https://www.instagram.com/allianz.australia/', icon: 'instagram' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@allianz.australia', icon: 'tiktok' },
];

export default function decorate(block) {
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.textContent = 'Follow us on';
  block.append(heading);

  const ul = document.createElement('ul');
  SOCIAL_LINKS.forEach(({ name, url, icon }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.title = `Visit Allianz Australia's ${name}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = `social-follow-link social-follow-${icon}`;
    a.setAttribute('aria-label', name);
    a.textContent = name;
    li.append(a);
    ul.append(li);
  });
  block.append(ul);
}
