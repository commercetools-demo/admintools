import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { logger } from '../utils/logger.utils';
import * as ContentStateController from '../controllers/content-state-controller';
import CustomError from '../errors/custom.error';

const contentItemStateRouter = Router();

// Get states for a content item
contentItemStateRouter.get(
  '/:businessUnitKey/content-items/:key/states',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessUnitKey, key } = req.params;
      const stateKey = `${businessUnitKey}_${key}`;

      try {
        const object = await ContentStateController.getState(stateKey);
        res.json(object);
      } catch (error) {
        // If not found, return empty states object
        if ((error as any).statusCode === 404) {
          res.json({
            key,
            businessUnitKey,
            states: {},
          });
        } else {
          throw new CustomError(500, 'Failed to get states');
        }
      }
    } catch (error) {
      logger.error('Failed to get states:', error);
      next(error);
    }
  }
);

// Save draft state
contentItemStateRouter.put(
  '/:businessUnitKey/content-items/:key/states/draft',
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const state = await ContentStateController.createDraftState(
        req.params.businessUnitKey,
        req.params.key,
        req.body
      );
      res.json(state);
    } catch (error) {
      logger.error('Failed to save draft state:', error);
      next(error);
    }
  }) as RequestHandler
);

// Publish state (move draft to published)
contentItemStateRouter.put(
  '/:businessUnitKey/content-items/:key/states/published',
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clearDraft } = req.query;
      const { businessUnitKey, key } = req.params;
      const { value } = req.body;

      const state = await ContentStateController.createPublishedState(
        businessUnitKey,
        key,
        value,
        clearDraft === 'true'
      );
      res.json(state);
    } catch (error) {
      logger.error('Failed to publish state:', error);
      next(error);
    }
  }) as RequestHandler
);

// Delete draft state (revert to published)
contentItemStateRouter.delete(
  '/:businessUnitKey/content-items/:key/states/draft',
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessUnitKey, key } = req.params;

      const state = await ContentStateController.deleteDraftState(
        businessUnitKey,
        key
      );
      res.json(state);
    } catch (error) {
      logger.error('Failed to delete draft state:', error);
      next(error);
    }
  }) as RequestHandler
);

export default contentItemStateRouter;
