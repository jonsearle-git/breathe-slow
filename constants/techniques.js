export const PHASE_TYPES = {
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
};

export const TECHNIQUES = [
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic',
    subtitle: 'Belly Breathing',
    description:
      'Breathe deep into your belly, letting your diaphragm do the work. Ideal for everyday calm.',
    gradient: ['#a8d8ea', '#d0eef8'],
    accentColor: '#4a90b8',
    phases: [
      { label: 'Inhale', duration: 4, type: 'inhale' },
      { label: 'Exhale', duration: 6, type: 'exhale' },
    ],
    cycles: 6,
  },
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: '4‑4‑4‑4 Pattern',
    description:
      'Equal parts inhale, hold, exhale, hold. A military favourite for staying composed.',
    gradient: ['#b0cfe8', '#d8ecf8'],
    accentColor: '#3a7fa0',
    phases: [
      { label: 'Inhale', duration: 4, type: 'inhale' },
      { label: 'Hold', duration: 4, type: 'hold' },
      { label: 'Exhale', duration: 4, type: 'exhale' },
      { label: 'Hold', duration: 4, type: 'hold' },
    ],
    cycles: 4,
  },
  {
    id: '478',
    name: '4‑7‑8 Breathing',
    subtitle: 'Relaxing Breath',
    description:
      'A natural tranquiliser for the nervous system. Inhale 4, hold 7, exhale 8.',
    gradient: ['#c4b0e0', '#e8e0f5'],
    accentColor: '#7058a8',
    phases: [
      { label: 'Inhale', duration: 4, type: 'inhale' },
      { label: 'Hold', duration: 7, type: 'hold' },
      { label: 'Exhale', duration: 8, type: 'exhale' },
    ],
    cycles: 4,
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    subtitle: '5 Breaths / Minute',
    description:
      'Breathing at 5 breaths per minute synchronises your heart and nervous system.',
    gradient: ['#a8d8c0', '#d0f0e0'],
    accentColor: '#38967a',
    phases: [
      { label: 'Inhale', duration: 6, type: 'inhale' },
      { label: 'Exhale', duration: 6, type: 'exhale' },
    ],
    cycles: 5,
  },
  {
    id: 'extended-exhale',
    name: 'Extended Exhale',
    subtitle: 'Calming Breath',
    description:
      'A longer exhale activates the parasympathetic system, shifting you from stress to rest.',
    gradient: ['#d8c4a8', '#f0e8d8'],
    accentColor: '#b07840',
    phases: [
      { label: 'Inhale', duration: 4, type: 'inhale' },
      { label: 'Exhale', duration: 8, type: 'exhale' },
    ],
    cycles: 5,
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril',
    subtitle: 'Nadi Shodhana',
    description:
      'An ancient yogic technique that balances the two hemispheres of the brain.',
    gradient: ['#e0b8c8', '#f5dde8'],
    accentColor: '#a84868',
    dualNostril: true,
    phases: [
      { label: 'Inhale', duration: 4, type: 'inhale', nostril: 'left' },
      { label: 'Hold', duration: 4, type: 'hold', nostril: 'both' },
      { label: 'Exhale', duration: 4, type: 'exhale', nostril: 'right' },
      { label: 'Inhale', duration: 4, type: 'inhale', nostril: 'right' },
      { label: 'Hold', duration: 4, type: 'hold', nostril: 'both' },
      { label: 'Exhale', duration: 4, type: 'exhale', nostril: 'left' },
    ],
    cycles: 4,
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    subtitle: 'Double Inhale',
    description:
      'Two nasal inhales followed by a long exhale. Rapidly reduces stress by deflating the air sacs in the lungs.',
    gradient: ['#f0c8a8', '#f8e8d8'],
    accentColor: '#c06840',
    phases: [
      { label: 'Inhale (nose)', duration: 2, type: 'inhale', targetRatio: 0.65 },
      { label: 'Second inhale (nose)', duration: 1, type: 'inhale', targetRatio: 1.0 },
      { label: 'Exhale (mouth)', duration: 6, type: 'exhale' },
    ],
    cycles: 5,
  },
  {
    id: 'pursed-lip',
    name: 'Pursed Lip',
    subtitle: 'Slow Release',
    description:
      'Inhale through the nose, exhale slowly through pursed lips. Helps ease shortness of breath.',
    gradient: ['#c0d8a8', '#dff0d0'],
    accentColor: '#5a9040',
    phases: [
      { label: 'Inhale', duration: 2, type: 'inhale' },
      { label: 'Exhale (pursed lips)', duration: 4, type: 'exhale' },
    ],
    cycles: 5,
  },
];
