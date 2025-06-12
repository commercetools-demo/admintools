import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
import { logger } from '../utils/logger.utils';
import { CustomObjectController } from '../controllers/custom-object.controller';
import { ContentItemController } from '../controllers/content-item.controller';
import { CONTENT_ITEM_STATE_CONTAINER } from './content-item-state.route';

const contentItemRouter = Router();
export const CONTENT_ITEM_CONTAINER =
  process.env.CONTENT_ITEM_CONTAINER || 'content-item';
const contentController = new CustomObjectController(CONTENT_ITEM_CONTAINER);

contentItemRouter.get(
  '/:businessUnitKey/content-items',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contentStateController = new CustomObjectController(
        CONTENT_ITEM_STATE_CONTAINER
      );
      const { businessUnitKey } = req.params;
      const contentItems = await contentController.getCustomObjects(
        `value(businessUnitKey = "${businessUnitKey}")`
      );

      const whereClause = contentItems
        ?.map(
          (item) =>
            `(key = "${item.key}" AND businessUnitKey = "${businessUnitKey}")`
        )
        .join(' OR ');
      const contentItemStates = whereClause
        ? await contentStateController.getCustomObjects(`value(${whereClause})`)
        : [];

      // Merge content items with their states
      const contentItemsWithStates = contentItems.map((item) => {
        const states = contentItemStates.find(
          (state) => state.value.key === item.key
        );
        return {
          ...item,
          states: states?.value?.states || {},
        };
      });

      res.json(contentItemsWithStates);
    } catch (error) {
      logger.error('Failed to get custom objects:', error);
      next(error);
    }
  }
);
contentItemRouter.get(
  '/:businessUnitKey/content-items/content-type/:contentType',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contentStateController = new CustomObjectController(
        CONTENT_ITEM_STATE_CONTAINER
      );
      const { businessUnitKey } = req.params;
      const contentItems = await contentController.getCustomObjects(
        `value(businessUnitKey = "${businessUnitKey}") AND value(type = "${req.params.contentType}")`
      );

      const whereClause = contentItems
        ?.map(
          (item) =>
            `(key = "${item.key}" AND businessUnitKey = "${businessUnitKey}")`
        )
        .join(' OR ');
      const contentItemStates = whereClause
        ? await contentStateController.getCustomObjects(`value(${whereClause})`)
        : [];

      // Merge content items with their states
      const contentItemsWithStates = contentItems.map((item) => {
        const states = contentItemStates.find(
          (state) => state.value.key === item.key
        );
        return {
          ...item,
          states: states?.value?.states || {},
        };
      });

      res.json(contentItemsWithStates);
    } catch (error) {
      logger.error('Failed to get custom objects:', error);
      next(error);
    }
  }
);

contentItemRouter.get(
  '/:businessUnitKey/content-items/:key',
  async (req, res, next) => {
    try {
      const { key } = req.params;

      const contentItem = await contentController.getCustomObject(key);
      if (!contentItem) {
        throw new Error('Content item not found');
      }
      const contentItemController = new ContentItemController(
        contentController
      );
      const object = await contentItemController.getContentItem(
        contentItem.value
      );
      res.json(object);
    } catch (error) {
      logger.error(
        `Failed to get custom object with key ${req.params.key}:`,
        error
      );
      next(error);
    }
  }
);

contentItemRouter.get(
  '/:businessUnitKey/published/content-items/:key',
  async (req, res, next) => {
    try {
      const { key, businessUnitKey } = req.params;
      const contentStateController = new CustomObjectController(
        CONTENT_ITEM_STATE_CONTAINER
      );

      const contentItemStates = await contentStateController.getCustomObjects(
        `value(key = "${key}" AND businessUnitKey = "${businessUnitKey}")`
      );
      if (
        contentItemStates.length === 0 ||
        !contentItemStates[0].value.states ||
        !contentItemStates[0].value.states.published
      ) {
        throw new Error('Content item not found');
      }
      const contentItemController = new ContentItemController(
        contentController
      );
      const object = await contentItemController.getContentItem(
        contentItemStates[0].value.states.published
      );
      res.json(object);
    } catch (error) {
      logger.error(
        `Failed to get custom object with key ${req.params.key}:`,
        error
      );
      next(error);
    }
  }
);

contentItemRouter.get(
  '/:businessUnitKey/preview/content-items/:key',
  async (req, res, next) => {
    try {
      const { key, businessUnitKey } = req.params;
      const contentStateController = new CustomObjectController(
        CONTENT_ITEM_STATE_CONTAINER
      );

      const contentItemStates = await contentStateController.getCustomObjects(
        `value(key = "${key}" AND businessUnitKey = "${businessUnitKey}")`
      );
      if (
        contentItemStates.length === 0 ||
        !contentItemStates[0].value.states ||
        (!contentItemStates[0].value.states.draft &&
          !contentItemStates[0].value.states.published)
      ) {
        throw new Error('Content item not found');
      }

      const contentItemController = new ContentItemController(
        contentController
      );
      const object = await contentItemController.getContentItem(
        contentItemStates[0].value.states.draft ||
          contentItemStates[0].value.states.published
      );
      res.json(object);
    } catch (error) {
      logger.error(
        `Failed to get custom object with key ${req.params.key}:`,
        error
      );
      next(error);
    }
  }
);

contentItemRouter.post('/:businessUnitKey/content-items/:key', (async (
  req,
  res,
  next
) => {
  try {
    const { businessUnitKey, key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res
        .status(400)
        .json({ error: 'Value is required in the request body' });
    }

    const object = await contentController.createCustomObject(key, {
      ...value,
      businessUnitKey,
    });
    res.status(201).json(object);
  } catch (error) {
    logger.error(
      `Failed to create custom object with key ${req.params.key}:`,
      error
    );
    next(error);
  }
}) as RequestHandler);

contentItemRouter.put('/:businessUnitKey/content-items/:key', (async (
  req,
  res,
  next
) => {
  try {
    const { businessUnitKey, key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res
        .status(400)
        .json({ error: 'Value is required in the request body' });
    }

    const object = await contentController.updateCustomObject(key, {
      ...value,
      businessUnitKey,
    });
    res.json(object);
  } catch (error) {
    logger.error(
      `Failed to update custom object with key ${req.params.key}:`,
      error
    );
    next(error);
  }
}) as RequestHandler);

contentItemRouter.delete(
  '/:businessUnitKey/content-items/:key',
  async (req, res, next) => {
    try {
      const { key } = req.params;
      await contentController.deleteCustomObject(key);
      res.status(204).send();
    } catch (error) {
      logger.error(
        `Failed to delete custom object with key ${req.params.key}:`,
        error
      );
      next(error);
    }
  }
);

export default contentItemRouter;
