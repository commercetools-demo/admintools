import { CustomObjectController } from './custom-object.controller';
import {
  CONTENT_ITEM_CONTAINER,
  CONTENT_ITEM_STATE_CONTAINER,
} from '../constants';
import CustomError from '../errors/custom.error';

export interface ContentItemState {
  key: string;
  businessUnitKey: string;
  states: Record<string, any>;
}

export const getContentStatesWithWhereClause = async (
  whereClause: string
): Promise<ContentItemState[]> => {
  const contentStateController = new CustomObjectController(
    CONTENT_ITEM_STATE_CONTAINER
  );
  const contentStates = await contentStateController.getCustomObjects(
    `value(${whereClause})`
  );
  return contentStates.map((state) => state.value);
};

export const getState = async (key: string): Promise<ContentItemState> => {
  const contentStateController = new CustomObjectController(
    CONTENT_ITEM_STATE_CONTAINER
  );
  const contentState = await contentStateController.getCustomObject(key);
  return contentState.value;
};

export const createDraftState = async (
  businessUnitKey: string,
  key: string,
  value: any
): Promise<ContentItemState> => {
  const stateKey = `${businessUnitKey}_${key}`;
  let existingState: ContentItemState;
  try {
    existingState = await getState(stateKey);
  } catch (error) {
    if ((error as any).statusCode === 404) {
      existingState = {
        key,
        businessUnitKey,
        states: {},
      };
    } else {
      throw new CustomError(500, 'Failed to create draft state');
    }
  }
  existingState.states = {
    ...existingState.states,
    draft: value,
  };

  const contentStateController = new CustomObjectController(
    CONTENT_ITEM_STATE_CONTAINER
  );
  const contentState = await contentStateController.updateCustomObject(
    stateKey,
    existingState
  );
  return contentState.value;
};

export const createPublishedState = async (
  businessUnitKey: string,
  key: string,
  value: any,
  clear?: boolean
): Promise<ContentItemState> => {
  const stateKey = `${businessUnitKey}_${key}`;
  let existingState: ContentItemState;
  try {
    existingState = await getState(stateKey);
  } catch (error) {
    if ((error as any).statusCode === 404) {
      existingState = {
        key,
        businessUnitKey,
        states: {},
      };
    } else {
      throw new CustomError(500, 'Failed to create published state');
    }
  }
  existingState.states = {
    ...existingState.states,
    published: value,
  };
  if (clear) {
    existingState.states = {
      ...existingState.states,
      draft: undefined,
    };
  }

  const contentStateController = new CustomObjectController(
    CONTENT_ITEM_STATE_CONTAINER
  );
  const contentState = await contentStateController.updateCustomObject(
    stateKey,
    existingState
  );
  return contentState.value;
};

export const deleteDraftState = async (
  businessUnitKey: string,
  key: string
): Promise<ContentItemState> => {
  const stateKey = `${businessUnitKey}_${key}`;
  let existingState: ContentItemState;
  try {
    existingState = await getState(stateKey);
  } catch (error) {
    if ((error as any).statusCode === 404) {
      existingState = {
        key,
        businessUnitKey,
        states: {},
      };
    } else {
      throw new CustomError(500, 'Failed to delete draft state');
    }
  }

  if (!existingState.states.published) {
    throw new CustomError(404, 'No published state found');
  }

  existingState.states = {
    ...existingState.states,
    draft: undefined,
  };

  const contentItemController = new CustomObjectController(
    CONTENT_ITEM_CONTAINER
  );

  const contentStateController = new CustomObjectController(
    CONTENT_ITEM_STATE_CONTAINER
  );
  await contentItemController.updateCustomObject(key, {
    ...existingState.states.published,
    businessUnitKey,
  });

  const contentState = await contentStateController.updateCustomObject(
    stateKey,
    existingState
  );
  return contentState.value;
};

export const deleteStates = async (
  businessUnitKey: string,
  key: string
): Promise<void> => {
  const stateKey = `${businessUnitKey}_${key}`;
  const contentStateController = new CustomObjectController(
    CONTENT_ITEM_STATE_CONTAINER
  );
  await contentStateController.deleteCustomObject(stateKey);
};
