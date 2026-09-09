const image = (id, width = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

// References remain centralised here so a component never selects an image by itself.
export const images = {
  hero: '/images/mechanical-room.png',
  technicalAudit: image('photo-1581094288338-2314dddb7ece'),
  mechanicalRoom: '/images/mechanical-room.png',
  refrigerationPlant: '/images/refrigeration-plant.png',
  airCompressor: '/images/air-compressor-room.png',
  industrialMotor: '/images/industrial-motor-vfd.png',
  industrialPipes: image('photo-1620203853151-496c7228306c'),
  industrialPlant: image('photo-1769695832195-dfe7e9f36980'),
  ductwork: image('photo-1558358235-a0a93f68a52c'),
  controlPanel: image('photo-1780034766295-43db0f2a0fb7'),
  warehouse: image('photo-1553413077-190dd305871c'),
  office: image('photo-1497366811353-6870744d04b2'),
  buildingEnvelope: image('photo-1565043589221-1a6fd9ae45c7'),
  thermalProcess: image('photo-1504917595217-d4dc5ebe6122'),
  retail: image('photo-1441986300917-64674bd600d8'),
  healthcare: image('photo-1519494026892-80bbd2d6fd0d'),
};
