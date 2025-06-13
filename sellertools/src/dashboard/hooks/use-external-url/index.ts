import { useCallback, useEffect, useState } from 'react';
import { SHARED_CONTAINER } from '../../../constants';
import { useCustomObject } from '../use-custom-objects';
import axios from 'axios';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';

export const useExternalUrl = ({
  storedUrlKey,
  healthCheckUrl,
  healthCheckHeaders,
}: {
  storedUrlKey: string;
  healthCheckUrl?: string;
  healthCheckHeaders?: Record<string, string>;
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const { getCustomObject } = useCustomObject(SHARED_CONTAINER);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthy, setIsHealthy] = useState(isDevelopment);
  const { project } = useApplicationContext();

  const fetchDeployedUrl = useCallback(async () => {
    try {
      const deployedUrlResult = await getCustomObject(storedUrlKey);
      setDeployedUrl(deployedUrlResult?.value);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching deployed URL:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [getCustomObject]);

  useEffect(() => {
    fetchDeployedUrl();
  }, [fetchDeployedUrl]);

  useEffect(() => {
    const checkHealth = async () => {
      const result = await axios.get(`${deployedUrl}${healthCheckUrl}`, {
        headers: healthCheckHeaders,
      });
      setIsHealthy(
        result.status === 200 && result.data.projectkey === project?.key
      );
    };

    if (deployedUrl && !isDevelopment && healthCheckUrl && healthCheckHeaders) {
      checkHealth();
    }
  }, [deployedUrl, isDevelopment, healthCheckHeaders, healthCheckUrl]);

  return { deployedUrl, isLoading, isHealthy };
};
