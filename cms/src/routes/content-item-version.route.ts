import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { logger } from '../utils/logger.utils';
import { CustomObjectController } from '../controllers/custom-object.controller';
import { v4 as uuidv4 } from 'uuid';

const contentItemVersionRouter = Router();
export const CONTENT_ITEM_VERSION_CONTAINER =
  process.env.CONTENT_ITEM_VERSION_CONTAINER || 'content-item-version';
const versionController = new CustomObjectController(
  CONTENT_ITEM_VERSION_CONTAINER
);

// Get all versions for a content item
contentItemVersionRouter.get(
  '/:businessUnitKey/content-items/:key/versions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessUnitKey, key } = req.params;
      const versionKey = `${businessUnitKey}_${key}`;

      try {
        const object = await versionController.getCustomObject(versionKey);
        res.json(object.value);
      } catch (error) {
        // If not found, return empty versions array
        if ((error as any).statusCode === 404) {
          res.json({
            key,
            businessUnitKey,
            versions: [],
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      logger.error('Failed to get versions:', error);
      next(error);
    }
  }
);

// Get a specific version
contentItemVersionRouter.get(
  '/:businessUnitKey/content-items/:key/versions/:versionId',
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessUnitKey, key, versionId } = req.params;
      const versionKey = `${businessUnitKey}_${key}`;

      const object = await versionController.getCustomObject(versionKey);
      const version = object.value.versions.find(
        (v: any) => v.id === versionId
      );

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      res.json(version);
    } catch (error) {
      logger.error('Failed to get version:', error);
      next(error);
    }
  }) as RequestHandler
);

// Save a new version
contentItemVersionRouter.post(
  '/:businessUnitKey/content-items/:key/versions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Saving new version');
      const { businessUnitKey, key } = req.params;
      const versionKey = `${businessUnitKey}_${key}`;
      const { value } = req.body;
      const maxVersions = parseInt(process.env.MAX_VERSIONS || '5', 10);

      if (!value) {
        throw new Error('No value provided');
      }

      let existingVersions;
      try {
        const existingObject =
          await versionController.getCustomObject(versionKey);
        existingVersions = existingObject.value;
      } catch (error) {
        // Create if not exists
        if ((error as any).statusCode === 404) {
          existingVersions = {
            key,
            businessUnitKey,
            versions: [],
          };
        } else {
          throw error;
        }
      }

      const newVersion = {
        ...value,
        timestamp: new Date().toISOString(),
        id: uuidv4(),
      };

      // Add new version at the beginning
      existingVersions.versions.unshift(newVersion);

      // Trim versions to max allowed
      if (existingVersions.versions.length > maxVersions) {
        existingVersions.versions = existingVersions.versions.slice(
          0,
          maxVersions
        );
      }

      const response = await versionController.updateCustomObject(
        versionKey,
        existingVersions
      );
      res.status(201).json(response.value);
    } catch (error) {
      logger.error('Failed to save version:', (error as Error).message);
      next(error);
    }
  }
);

export default contentItemVersionRouter;
