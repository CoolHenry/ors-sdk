export const getEntity = (entity: string | undefined) => {
  const msOrigin = 'https://ors.msxf.com'; // 马消
  const jhyOrigin = 'https://ors.pulsarfintech.com'; //镜花缘-外网地址
  if (entity === 'jhy') {
    return jhyOrigin;
  } else {
    return msOrigin;
  }
};
