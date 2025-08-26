import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import * as ContentVersionController from '../controllers/content-version-controller';
import { logger } from '../utils/logger.utils';

const contentItemVersionRouter = Router();

// Get all versions for a content item
contentItemVersionRouter.get(
  '/:businessUnitKey/content-items/:key/versions',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessUnitKey, key } = req.params;
      const versions = await ContentVersionController.getContentVersions(
        businessUnitKey,
        key
      );
      res.json(versions);
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
      const version = await ContentVersionController.getContentVersion(
        businessUnitKey,
        key,
        versionId
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
      const { value } = req.body;
      const response = await ContentVersionController.createContentVersion(
        businessUnitKey,
        key,
        value
      );

      res.status(201).json(response);
    } catch (error) {
      logger.error('Failed to save version:', (error as Error).message);
      next(error);
    }
  }
);

export default contentItemVersionRouter;
