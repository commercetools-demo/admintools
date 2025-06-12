import { Router, RequestHandler } from 'express';
import { logger } from '../utils/logger.utils';
import { CustomObjectController } from '../controllers/custom-object.controller';
import { sampleContentTypeRegistry } from '../utils/constants';

export const CONTENT_TYPE_CONTAINER =
  process.env.CONTENT_TYPE_CONTAINER || 'content-type';

const contentTypeController = new CustomObjectController(
  CONTENT_TYPE_CONTAINER
);
const contentTypeRouter = Router();

contentTypeRouter.get('/content-type', async (req, res, next) => {
  try {
    const dynamicContentTypes = await contentTypeController.getCustomObjects();
    const staticContentTypes = Object.values(sampleContentTypeRegistry);
    res.json([
      ...dynamicContentTypes.map((item) => item.value),
      ...staticContentTypes,
    ]);
  } catch (error) {
    logger.error('Failed to get content-type objects:', error);
    next(error);
  }
});

contentTypeRouter.get('/content-type/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const object = await contentTypeController.getCustomObject(key);
    res.json(object);
  } catch (error) {
    logger.error(
      `Failed to get content-type object with key ${req.params.key}:`,
      error
    );
    next(error);
  }
});

contentTypeRouter.post('/content-type/:key', (async (req, res, next) => {
  try {
    // return error if key exists
    const { key } = req.params;
    try {
      const objectExists = await contentTypeController.getCustomObject(key);
      if (objectExists) {
        return res
          .status(400)
          .json({ error: 'content-type object with key already exists' });
      }
    } catch (error) {
      logger.error(
        `Failed to get content-type object with key ${req.params.key}:`,
        error
      );
    }
    const { value } = req.body;
    const object = await contentTypeController.createCustomObject(key, value);
    res.status(201).json(object);
  } catch (error) {
    logger.error(
      `Failed to create registry object with key ${req.params.key}:`,
      error
    );
    next(error);
  }
}) as RequestHandler);

contentTypeRouter.put('/content-type/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const object = await contentTypeController.updateCustomObject(key, value);
    res.json(object);
  } catch (error) {
    logger.error(
      `Failed to update registry object with key ${req.params.key}:`,
      error
    );
    next(error);
  }
});

contentTypeRouter.delete('/content-type/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    await contentTypeController.deleteCustomObject(key);
    res.status(204).send();
  } catch (error) {
    logger.error(
      `Failed to update registry object with key ${req.params.key}:`,
      error
    );
    next(error);
  }
});

export default contentTypeRouter;
