import { Router } from 'express';
import contentTypeRouter from './content-type.route';
import contentItemRouter from './content-item.route';
import pagesRouter from './pages.route';
import fileRouter from './file.route';
import datasourceRouter from './datasource.route';
import proxyRouter from './proxy.route';
import contentItemVersionRouter from './content-item-version.route';
import contentItemStateRouter from './content-item-state.route';
import pageVersionRouter from './page-version.route';
import pageStateRouter from './page-state.route';
import { readConfiguration } from '../utils/config.utils';
import { logger } from '../utils/logger.utils';

const serviceRouter = Router();

serviceRouter.use('/', contentTypeRouter);
serviceRouter.use('/', contentItemRouter);
serviceRouter.use('/', pagesRouter);
serviceRouter.use('/', fileRouter);
serviceRouter.use('/', datasourceRouter);
serviceRouter.use('/', proxyRouter);
serviceRouter.use('/', contentItemVersionRouter);
serviceRouter.use('/', contentItemStateRouter);
serviceRouter.use('/', pageVersionRouter);
serviceRouter.use('/', pageStateRouter);

serviceRouter.get('/ping', async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: 'pong', projectkey: readConfiguration().projectKey });
  } catch (error) {
    logger.error('Error processing chat request:', error);
    res.status(500).json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default serviceRouter;
