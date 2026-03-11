export const VEHICLES = [
    { id: 'BUS-042', model: 'Marcopolo Paradiso G7', route: '611 Rautatientori', km: '142 350 km', qrCode: 'BUSSI-042-G7' },
    { id: 'BUS-015', model: 'Volvo 9700', route: '550 Itäkeskus', km: '98 200 km', qrCode: 'BUSSI-015-V9700' },
    { id: 'BUS-078', model: 'Scania Citywide', route: '23 Ruskeasuo', km: '210 100 km', qrCode: 'BUSSI-078-SC' },
    { id: 'BUS-103', model: 'Mercedes Citaro', route: '66A Arabianranta', km: '175 800 km', qrCode: 'BUSSI-103-MC' },
    { id: 'BUS-091', model: "MAN Lion's City", route: '14 Hernesaari', km: '134 600 km', qrCode: 'BUSSI-091-MAN' },
    { id: 'BUS-056', model: 'BYD K9', route: '560 Matinkylä', km: '56 200 km', qrCode: 'BUSSI-056-BYD' },
];

export const INITIAL_DEFECTS = [
    { id: 1, part: 'Sivupeilit (peili)', status: 'yellow', description: 'Oikea sivupeili haljennut', reportedAt: '2026-03-08T02:00:00Z', vehicle: 'BUS-042', photo: null },
    { id: 2, part: 'Takapuskuri (pohja)', status: 'red', description: 'Peruutuskolari, lommo ja maalinlähtö', reportedAt: '2026-03-08T01:15:00Z', vehicle: 'BUS-042', photo: null },
    { id: 3, part: 'Tuulilasi', status: 'green', description: 'Pieni kiveniskemä oikeassa alakulmassa', reportedAt: '2026-03-07T14:30:00Z', vehicle: 'BUS-042', photo: null },
    { id: 4, part: 'Eturenkaat', status: 'yellow', description: 'Kulunut rengaspinta vasemmassa eturenkaassa', reportedAt: '2026-03-07T10:00:00Z', vehicle: 'BUS-015', photo: null },
];
