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

export default serviceRouter;
