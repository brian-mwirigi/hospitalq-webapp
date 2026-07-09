import QRCode from 'qrcode';

export async function generateDeptQR(deptSlug) {
  const url = `${process.env.CLIENT_URL}/queue/${deptSlug}`;
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#0B6E4F',
      light: '#FFFFFF',
    },
  });
}
