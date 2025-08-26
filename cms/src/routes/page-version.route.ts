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
import { MAX_VERSIONS } from '../constants';
import CustomError from '../errors/custom.error';

const pageVersionRouter = Router();
export const PAGE_VERSION_CONTAINER =
  process.env.PAGE_VERSION_CONTAINER || 'page-version';
const versionController = new CustomObjectController(PAGE_VERSION_CONTAINER);

// Get all versions for a page
pageVersionRouter.get(
  '/:businessUnitKey/pages/:key/versions',
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
          throw new CustomError(500, 'Failed to get versions');
        }
      }
    } catch (error) {
      logger.error('Failed to get versions:', error);
      next(error);
    }
  }
);

// Get a specific version
pageVersionRouter.get(
  '/:businessUnitKey/pages/:key/versions/:versionId',
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
pageVersionRouter.post('/:businessUnitKey/pages/:key/versions', (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessUnitKey, key } = req.params;
    const versionKey = `${businessUnitKey}_${key}`;
    const { value } = req.body;

    if (!value) {
      return res
        .status(400)
        .json({ error: 'Value is required in the request body' });
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
        throw new CustomError(500, 'Failed to save version');
      }
    }

    const newVersion = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...value,
    };

    // Add new version at the beginning
    existingVersions.versions.unshift(newVersion);

    // Trim versions to max allowed
    if (existingVersions.versions.length > MAX_VERSIONS) {
      existingVersions.versions = existingVersions.versions.slice(
        0,
        MAX_VERSIONS
      );
    }

    const response = await versionController.updateCustomObject(
      versionKey,
      existingVersions
    );
    res.status(201).json(response.value);
  } catch (error) {
    logger.error('Failed to save version:', error);
    next(error);
  }
}) as RequestHandler);

export default pageVersionRouter;
