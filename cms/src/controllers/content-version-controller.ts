import { v4 as uuidv4 } from 'uuid';
import { CustomObjectController } from './custom-object.controller';
import { CONTENT_ITEM_VERSION_CONTAINER, MAX_VERSIONS } from '../constants';
import CustomError from '../errors/custom.error';

export interface ContentItemVersion {
  key: string;
  businessUnitKey: string;
  versions: any[];
}

export const getContentVersions = async (
  businessUnitKey: string,
  key: string
): Promise<ContentItemVersion> => {
  const contentVersionController = new CustomObjectController(
    CONTENT_ITEM_VERSION_CONTAINER
  );
  try {
    const versionKey = `${businessUnitKey}_${key}`;

    const contentVersions =
      await contentVersionController.getCustomObject(versionKey);
    return contentVersions.value;
  } catch (error) {
    if ((error as any).statusCode === 404) {
      return {
        key,
        businessUnitKey,
        versions: [],
      };
    } else {
      throw new CustomError(500, 'Failed to get versions');
    }
  }
};

export const getContentVersion = async (
  businessUnitKey: string,
  key: string,
  versionId: string
): Promise<ContentItemVersion> => {
  const versions = await getContentVersions(businessUnitKey, key);
  return versions.versions.find((version) => version.id === versionId);
};

export const createContentVersion = async (
  businessUnitKey: string,
  key: string,
  value: any
): Promise<ContentItemVersion> => {
  const versionKey = `${businessUnitKey}_${key}`;
  const existingVersions = await getContentVersions(businessUnitKey, key);

  const newVersion = {
    ...value,
    timestamp: new Date().toISOString(),
    id: uuidv4(),
  };

  existingVersions.versions.unshift(newVersion);

  const contentVersionController = new CustomObjectController(
    CONTENT_ITEM_VERSION_CONTAINER
  );

  if (existingVersions.versions.length > MAX_VERSIONS) {
    existingVersions.versions = existingVersions.versions.slice(
      0,
      MAX_VERSIONS
    );
  }
  const contentVersion = await contentVersionController.updateCustomObject(
    versionKey,
    existingVersions
  );
  return contentVersion.value;
};

export const deleteVersions = async (
  businessUnitKey: string,
  key: string
): Promise<void> => {
  const versionKey = `${businessUnitKey}_${key}`;
  const contentVersionController = new CustomObjectController(
    CONTENT_ITEM_VERSION_CONTAINER
  );
  await contentVersionController.deleteCustomObject(versionKey);
};
