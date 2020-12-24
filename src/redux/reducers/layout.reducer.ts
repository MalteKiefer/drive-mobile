import { layoutActionTypes } from '../constants';

const initialState = {
  searchActive: false,
  createFolderActive: false,
  showSettingsModal: false,
  showItemModal: false,
  showSortModal: false,
  showMoveModal: false,
  showDeleteModal: false,
  showShareModal: false,
  showOutOfSpaceModal: false
};

export function layoutReducer(state = initialState, action: any) {
  switch (action.type) {
    case layoutActionTypes.OPEN_CREATE_FOLDER_FORM:
      return {
        searchActive: false,
        createFolderActive: true
      };
    case layoutActionTypes.CLOSE_CREATE_FOLDER_FORM:
      return {
        ...state,
        createFolderActive: false
      };
    case layoutActionTypes.OPEN_SEARCH_FORM:
      return {
        ...state,
        searchActive: true
      };
    case layoutActionTypes.CLOSE_SEARCH_FORM:
      return {
        ...state,
        searchActive: false
      };
    case layoutActionTypes.OPEN_SETTINGS_MODAL:
      return {
        ...state,
        showSettingsModal: true
      }
    case layoutActionTypes.CLOSE_SETTINGS_MODAL:
      return {
        ...state,
        showSettingsModal: false
      }
    case layoutActionTypes.OPEN_ITEM_MODAL:
      return {
        ...state,
        showItemModal: true
      }
    case layoutActionTypes.CLOSE_ITEM_MODAL:
      return {
        ...state,
        showItemModal: false
      }
    case layoutActionTypes.OPEN_SORT_MODAL: {
      return {
        ...state,
        showSortModal: true
      }
    }
    case layoutActionTypes.CLOSE_SORT_MODAL: {
      return {
        ...state,
        showSortModal: false
      }
    }
    
    case layoutActionTypes.OPEN_MOVEFILES_MODAL: {
      return {
        ...state,
        showMoveModal: true
      }
    }
    case layoutActionTypes.CLOSE_MOVEFILES_MODAL: {
      return {
        ...state,
        showMoveModal: false
      }
    }

    case layoutActionTypes.OPEN_DELETE_MODAL: {
      return {
        ...state,
        showDeleteModal: true
      }
    }
    case layoutActionTypes.CLOSE_DELETE_MODAL: {
      return {
        ...state,
        showDeleteModal: false
      }
    }

    case layoutActionTypes.OPEN_SHARE_MODAL: {
      return {
        ...state,
        showShareModal: true
      }
    }
    case layoutActionTypes.CLOSE_SHARE_MODAL: {
      return {
        ...state,
        showShareModal: false
      }
    }

    case layoutActionTypes.OPEN_OUT_OF_SPACE_MODAL: {
      return {
        ...state,
        showOutOfSpaceModal: true
      }
    }
    case layoutActionTypes.CLOSE_OUT_OF_SPACE_MODAL: {
      return {
        ...state,
        showOutOfSpaceModal: false
      }
    }
    default:
      return state;
  }
}