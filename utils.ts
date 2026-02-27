export const generateRandomId = (length: number) => Math.random().toString(36).substring(2, 2 + length).toUpperCase();

export const generateOrderId = () => `560${Math.floor(10000 + Math.random() * 90000)}`;

export const generateSerialNumber = () => {
  const side = Math.random() > 0.5 ? 'B' : 'L';
  const hexId = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${side}${hexId}${randomDigits}`;
};

export const getPcbSide = (sn: string) => {
  if (!sn) return 'N/A';
  const firstChar = sn.charAt(0).toUpperCase();
  return firstChar === 'B' ? 'BOT' : (firstChar === 'L' ? 'TOP' : 'N/A');
};

export const generateProduct = () => {
  const hexId = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  const names = ['MIB3-Navi', 'Amp-Booster', 'Cluster-Dig', 'Radio-Entry', 'Disp-Touch', 'Tcu-Mod'];
  const name = names[Math.floor(Math.random() * names.length)];
  const ver = `V${Math.floor(Math.random() * 4) + 1}`;
  return `${hexId} ${name} ${ver}`;
};

export const getCurrentShift = (dateObj = new Date()) => {
  const hour = dateObj.getHours();
  return (hour >= 7 && hour < 19) ? 'Zmiana I' : 'Zmiana II';
};

export const getFormattedDateTime = (dateObj = new Date()) => {
  return dateObj.toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const isTimestampInCurrentShift = (timestampStr: string): boolean => {
    try {
        // Parse "DD.MM.YYYY, HH:mm"
        const [datePart, timePart] = timestampStr.split(', ');
        const [day, month, year] = datePart.split('.').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        const docDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();

        // Check if same calendar day
        // NOTE: Real factory logic for night shift spanning 2 days is more complex.
        // Simplified here to match "Current Shift" string logic.
        const isSameDay = docDate.toDateString() === now.toDateString();
        const docShift = getCurrentShift(docDate);
        const currentShift = getCurrentShift(now);

        return isSameDay && docShift === currentShift;
    } catch (e) {
        return false;
    }
};

export const isSmtLine = (lineName: string) => lineName && (lineName.includes('CMPO') || lineName.includes('DMPO') || lineName.includes('SMT'));