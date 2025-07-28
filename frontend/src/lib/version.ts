export const DEPLOYMENT_VERSION = process.env.NEXT_PUBLIC_DEPLOYMENT_VERSION || Date.now().toString();
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString();

export const getVersionedUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${DEPLOYMENT_VERSION}&t=${Date.now()}`;
};

export const getDeploymentInfo = () => ({
  version: DEPLOYMENT_VERSION,
  buildTime: BUILD_TIME,
  timestamp: Date.now()
});
