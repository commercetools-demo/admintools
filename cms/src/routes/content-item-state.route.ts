import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { logger } from '../utils/logger.utils';
import { CustomObjectController } from '../controllers/custom-object.controller';

const contentItemStateRouter = Router();
export const CONTENT_ITEM_STATE_CONTAINER =
  process.env.CONTENT_ITEM_STATE_CONTAINER || 'content-item-state';
const stateController = new CustomObjectController(
  CONTENT_ITEM_STATE_CONTAINER
);

// Get states for a content item
contentItemStateRouter.get(
  '/:businessUnitKey/content-items/:key/states',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessUnitKey, key } = req.params;
      const stateKey = `${businessUnitKey}_${key}`;

      try {
        const object = await stateController.getCustomObject(stateKey);
        res.json(object.value);
      } catch (error) {
        // If not found, return empty states object
        if ((error as any).statusCode === 404) {
          res.json({
            key,
            businessUnitKey,
            states: {},
          });
        } else {
          throw error;
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
      const { businessUnitKey, key } = req.params;
      const stateKey = `${businessUnitKey}_${key}`;
      const { value } = req.body;

      if (!value) {
        return res
          .status(400)
          .json({ error: 'Value is required in the request body' });
      }

      let existingStates;
      try {
        const existingObject = await stateController.getCustomObject(stateKey);
        existingStates = existingObject.value;
      } catch (error) {
        // Create if not exists
        if ((error as any).statusCode === 404) {
          existingStates = {
            key,
            businessUnitKey,
            states: {},
          };
        } else {
          throw error;
        }
      }

      // Update draft state
      existingStates.states.draft = value;

      const object = await stateController.updateCustomObject(
        stateKey,
        existingStates
      );
      res.json(object.value);
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
      const { businessUnitKey, key } = req.params;
      const stateKey = `${businessUnitKey}_${key}`;
      const { value } = req.body;

      if (!value) {
        return res
          .status(400)
          .json({ error: 'Value is required in the request body' });
      }

      let existingStates;
      try {
        const existingObject = await stateController.getCustomObject(stateKey);
        existingStates = existingObject.value;
      } catch (error) {
        // Create if not exists
        if ((error as any).statusCode === 404) {
          existingStates = {
            key,
            businessUnitKey,
            states: {},
          };
        } else {
          throw error;
        }
      }

      // Update published state
      existingStates.states.published = value;

      // If requested specifically, also remove draft state
      if (req.query.clearDraft === 'true') {
        existingStates.states.draft = undefined;
      }

      const object = await stateController.updateCustomObject(
        stateKey,
        existingStates
      );
      res.json(object.value);
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
      const stateKey = `${businessUnitKey}_${key}`;

      try {
        const existingObject = await stateController.getCustomObject(stateKey);
        const existingStates = existingObject.value;

        // Remove draft
        existingStates.states.draft = undefined;

        const object = await stateController.updateCustomObject(
          stateKey,
          existingStates
        );
        res.json(object.value);
      } catch (error) {
        if ((error as any).statusCode === 404) {
          return res.status(404).json({ error: 'State not found' });
        }
        throw error;
      }
    } catch (error) {
      logger.error('Failed to delete draft state:', error);
      next(error);
    }
  }) as RequestHandler
);

export default contentItemStateRouter;
