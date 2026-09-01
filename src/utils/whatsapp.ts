import { School } from '../types';

export function generateWhatsAppMessage(school: School, mascotName: string = 'Kona-chan'): string {
  const currentUrl = window.location.origin + '?q=' + encodeURIComponent(school.name);
  
  // Categorize CCAs
  const sports = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('SPORT')).map(c => c.ccaGrouping);
  const arts = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('PERFORMING') || c.ccaCategory.toUpperCase().includes('ART')).map(c => c.ccaGrouping);
  const uniform = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('UNIFORM')).map(c => c.ccaGrouping);
  const clubs = school.ccas.filter(c => c.ccaCategory.toUpperCase().includes('CLUB')).map(c => c.ccaGrouping);

  // Badges
  const badges: string[] = [];
  if (school.isAutonomous) badges.push('Autonomous');
  if (school.isSap) badges.push('SAP');
  if (school.isIp) badges.push('Integrated Programme (IP)');
  if (school.isGifted) badges.push('Gifted (GEP)');

  let text = `🌸 *${school.name}* (${school.mainLevel})\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  
  if (badges.length > 0) {
    text += `✨ *Highlights:* ${badges.join(' • ')}\n`;
  }
  
  text += `📍 *Location:* ${school.address} (Zone: ${school.zone})\n`;
  if (school.mrt) {
    text += `🚇 *Nearest MRT:* ${school.mrt}\n`;
  }
  if (school.bus) {
    text += `🚌 *Buses:* ${school.bus}\n`;
  }

  text += `\n🎯 *CCAs Offered (${school.ccas.length} Total):*\n`;
  
  if (sports.length > 0) {
    text += `⚽ *Sports (${sports.length}):* ${sports.slice(0, 6).join(', ')}${sports.length > 6 ? ` +${sports.length - 6} more` : ''}\n`;
  }
  if (arts.length > 0) {
    text += `🎭 *Performing Arts (${arts.length}):* ${arts.slice(0, 6).join(', ')}${arts.length > 6 ? ` +${arts.length - 6} more` : ''}\n`;
  }
  if (uniform.length > 0) {
    text += `🎖️ *Uniformed Groups (${uniform.length}):* ${uniform.join(', ')}\n`;
  }
  if (clubs.length > 0) {
    text += `🔬 *Clubs & Societies (${clubs.length}):* ${clubs.slice(0, 6).join(', ')}${clubs.length > 6 ? ` +${clubs.length - 6} more` : ''}\n`;
  }

  if (school.programmes && school.programmes.length > 0) {
    text += `\n🌟 *Distinctive Programmes:*\n`;
    school.programmes.slice(0, 2).forEach(p => {
      text += `• _${p.programmeType}:_ ${p.title}\n`;
    });
  }

  text += `\n💬 *${mascotName} says:* "Check out all the club details and explore more Singapore schools here! (≧∇≦)b"\n`;
  text += `🔗 *View details & explore:* ${currentUrl}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🇸🇬 _Data source: Ministry of Education via data.gov.sg (Collection 457)_`;

  return text;
}

export function openWhatsAppShare(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}
