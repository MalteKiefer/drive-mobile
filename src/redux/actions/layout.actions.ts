import { Dispatch } from 'redux';
import { layoutActionTypes, fileActionTypes } from '../constants';

export const layoutActions = {
  openSearch,
  closeSearch,
  openSettings,
  closeSettings,
  openItemModal,
  closeItemModal,
  openAddItemModal,
  closeAddItemModal,
  openRunOutStorageModal,
  closeRunOutStorageModal,
  openFreeForYouModal,
  closeFreeForYouModal,
  openSortModal,
  closeSortModal,
  openMoveFilesModal,
  closeMoveFilesModal,
  openDeleteModal,
  closeDeleteModal,
  openShareModal,
  closeShareModal,
  openComingSoonModal,
  closeComingSoonModal,
  openUploadFileModal,
  closeUploadFileModal
};

function openSearch() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_SEARCH_FORM });
  };
}

function closeSearch() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_SEARCH_FORM });
  };
}

function openSettings() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_SETTINGS_MODAL });
  };
}

function closeSettings() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_SETTINGS_MODAL });
  };
}

function openItemModal(item: any) {
  return (dispatch: Dispatch): void => {
    if (item) {
      dispatch({ type: fileActionTypes.SELECT_FILE, payload: item });
    }
    dispatch({ type: layoutActionTypes.OPEN_ITEM_MODAL, payload: item });
  };
}

function closeItemModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_ITEM_MODAL });
  };
}

function openAddItemModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_ADD_ITEM_MODAL });
  };
}

function closeAddItemModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_ADD_ITEM_MODAL });
  };
}

function openRunOutStorageModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_RUNOUTSTORAGE_MODAL });
  };
}

function openFreeForYouModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_FREEFORYOU_MODAL });
  };
}

function closeFreeForYouModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_FREEFORYOU_MODAL });
  };
}

function closeRunOutStorageModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_RUNOUTSTORAGE_MODAL });
  };
}

function openSortModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_SORT_MODAL });
  };
}

function closeSortModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_SORT_MODAL });
  };
}

function openMoveFilesModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_MOVEFILES_MODAL });
  };
}

function closeMoveFilesModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_MOVEFILES_MODAL });
  };
}

function openDeleteModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_DELETE_MODAL });
  };
}

function closeDeleteModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_DELETE_MODAL });
  };
}

function openShareModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_SHARE_MODAL });
  };
}

function closeShareModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_SHARE_MODAL });
  };
}

function openUploadFileModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_UPLOAD_FILE_MODAL });
  };
}

function closeUploadFileModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_UPLOAD_FILE_MODAL });
  };
}

function openComingSoonModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.OPEN_COMING_SOON_MODAL });
  };
}

function closeComingSoonModal() {
  return (dispatch: Dispatch): void => {
    dispatch({ type: layoutActionTypes.CLOSE_COMING_SOON_MODAL });
  };
}