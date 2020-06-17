import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  TaskCards,
  TaskLists,
  TaskBoards,
  TaskCardsArray,
  TaskListsArray,
  TaskBoardsArray,
} from '../models/Task';
import { currentUser, isSignedIn, isOwnedBy } from '../models/Auth';
import firebase from '../config/firebase';
import { db } from '../config/firebase';
import { AppThunk } from './store';
import { Notification, setNotification } from './appSlice';

interface TasksState {
  cards: TaskCards;
  lists: TaskLists;
  boards: TaskBoards;
  loading: boolean;
  error: any;
}
const initialState: TasksState = {
  cards: {},
  lists: {},
  boards: {},
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    accessStart(state) {
      state.loading = true;
      state.error = null;
    },
    accessFailure(state, action: PayloadAction<any>) {
      state.loading = false;
      state.error = action.payload;
    },
    // awaitに続くコードが成功(Success)時に行う処理
    getDataSuccess(
      state,
      action: PayloadAction<{
        cards: TaskCards;
        lists: TaskLists;
        boards: TaskBoards;
      }>
    ) {
      const { cards, lists, boards } = action.payload;
      state.cards = cards;
      state.lists = lists;
      state.boards = boards;
      state.loading = false;
      state.error = null;
    },

    addCardSuccess(
      state,
      action: PayloadAction<{
        taskListId: string;
        id: string;
        title: string;
      }>
    ) {
      if (!!!currentUser) return;
      const { taskListId, id, title } = action.payload;
      const newCard = {
        // 'currentUser'がいない('undefined'になる)場合、'addCard()'側でブロックする
        userId: currentUser.uid,
        taskListId: taskListId,
        id: id,
        title: title,
        done: false,
        body: '',
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
      };
      state.cards = { ...state.cards, [id]: newCard };
      state.lists[taskListId].cards.push(newCard);
      state.loading = false;
      state.error = null;
    },

    removeCardSuccess(state, action: PayloadAction<{ taskCardId: string }>) {
      const cardId = action.payload.taskCardId;
      const listId = state.cards[cardId].taskListId;
      delete state.cards[cardId];
      state.lists[listId].cards.filter((card) => card.id !== cardId);
      state.loading = false;
      state.error = null;
    },

    editCardSuccess(
      state,
      action: PayloadAction<{
        taskCardId: string;
        title?: string;
        body?: string;
      }>
    ) {
      const { taskCardId, title, body } = action.payload;
      const card = state.cards[taskCardId];
      const listId = card.taskListId;
      const cardOfList = state.lists[listId].cards.find(
        (card) => card.id === taskCardId
      );
      if (cardOfList) {
        if (title) {
          card.title = title;
          cardOfList.title = title;
        }
        if (body) {
          card.body = body;
          cardOfList.body = body;
        }
        card.updatedAt = firebase.firestore.Timestamp.now();
        cardOfList.updatedAt = card.updatedAt;
      }
      state.loading = false;
      state.error = null;
    },

    toggleCardSuccess(state, action: PayloadAction<{ taskCardId: string }>) {
      const { taskCardId } = action.payload;
      const card = state.cards[taskCardId];
      const listId = card.taskListId;
      const cardOfList = state.lists[listId].cards.find(
        (card) => card.id === taskCardId
      );
      card.done = !card.done;
      if (cardOfList) cardOfList.done = !card.done;
      state.loading = false;
      state.error = null;
    },

    addListSuccess: (
      state,
      action: PayloadAction<{ taskBoardId: string; id: string; title: string }>
    ) => {
      if (!!!currentUser) return;
      const { taskBoardId, id, title } = action.payload;
      const newList = {
        userId: currentUser.uid,
        taskBoardId: taskBoardId,
        id: id,
        title: title,
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
        cards: [],
      };
      state.lists = { ...state.lists, [id]: newList };
      state.loading = false;
      state.error = null;
    },

    editListSuccess(
      state,
      action: PayloadAction<{
        taskListId: string;
        title: string;
      }>
    ) {
      const { taskListId, title } = action.payload;
      const list = state.lists[taskListId];
      list.title = title;
      list.updatedAt = firebase.firestore.Timestamp.now();
      state.loading = false;
      state.error = null;
    },

    removeListSuccess(state, action: PayloadAction<{ taskListId: string }>) {
      const { taskListId } = action.payload;
      delete state.lists[taskListId];
      // オブジェクト型での条件付き処理
      Object.values(state.cards).forEach(
        (card) => card.taskListId === taskListId && delete state.cards[card.id]
      );
      state.loading = false;
      state.error = null;
    },

    addBoardSuccess: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      if (!!!currentUser) return;
      const { id, title } = action.payload;
      const newBoard = {
        userId: currentUser.uid,
        id: id,
        title: title,
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
      };
      state.boards = { ...state.boards, [id]: newBoard };
      state.loading = false;
      state.error = null;
    },

    removeBoardSuccess(state, action: PayloadAction<{ taskBoardId: string }>) {
      const { taskBoardId } = action.payload;
      delete state.lists[taskBoardId];
      // オブジェクト型での条件付き処理
      Object.values(state.lists).forEach((list) => {
        if (list.taskBoardId === taskBoardId) {
          Object.values(state.cards).forEach(
            (card) => card.taskListId === list.id && delete state.cards[card.id]
          );
          list.taskBoardId === taskBoardId && delete state.lists[list.id];
        }
      });
      state.loading = false;
      state.error = null;
    },

    editBoardSuccess(
      state,
      action: PayloadAction<{
        taskBoardId: string;
        title: string;
      }>
    ) {
      const { taskBoardId, title } = action.payload;
      const board = state.boards[taskBoardId];
      board.title = title;
      board.updatedAt = firebase.firestore.Timestamp.now();
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  accessStart,
  accessFailure,
  getDataSuccess,
  addCardSuccess,
  removeCardSuccess,
  editCardSuccess,
  toggleCardSuccess,
  addListSuccess,
  editListSuccess,
  removeListSuccess,
  addBoardSuccess,
  removeBoardSuccess,
  editBoardSuccess,
} = tasksSlice.actions;

export default tasksSlice;

// 初回データの取得
export const fetchData = (): AppThunk => async (dispatch) => {
  try {
    const cardsArray: TaskCardsArray = []; // DBから取得するデータの配列
    const listsArray: TaskListsArray = [];
    const boardsArray: TaskBoardsArray = [];
    dispatch(accessStart());
    await db
      .collectionGroup('cards')
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          // idを加えて配列に追加、型アサーションを付与
          cardsArray.push({ id: doc.id, ...doc.data() } as TaskCards['id']);
        });
      });
    // TaskCardsArray (配列) から TaskCards (オブジェクト) への変換
    // 例) [{id: '1', title: 'a'}, {...}] -> {'1': {id: '1', title: 'a'}, '2': {...}}
    // reduce(): 反復処理でaccumulator(acc)に結果を蓄積し最終結果を返す、初期値={}
    const cards = cardsArray.reduce((acc, card) => {
      acc[card.id] = card;
      return acc;
    }, {} as TaskCards);

    await db
      .collectionGroup('lists')
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          listsArray.push({ id: doc.id, ...doc.data() } as TaskLists['id']);
        });
      });
    const lists = listsArray.reduce((acc, list) => {
      acc[list.id] = list;
      return acc;
    }, {} as TaskLists);

    await db
      .collection('boards')
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          boardsArray.push({ id: doc.id, ...doc.data() } as TaskBoards['id']);
        });
      });
    const boards = boardsArray.reduce((acc, board) => {
      acc[board.id] = board;
      return acc;
    }, {} as TaskBoards);
    dispatch(getDataSuccess({ cards, lists, boards }));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const addCard = (props: {
  // キーワード引数のように振る舞う
  taskListId: string;
  title: string;
}): AppThunk => async (dispatch, getState) => {
  const { taskListId, title } = props;
  // storeからデータ取得
  const boardId = getState().tasks.lists[taskListId].taskBoardId;
  const cardsRef = db.collection('boards').doc(boardId).collection('cards');
  const listsRef = db.collection('boards').doc(boardId).collection('lists');
  // ログインしていなければ処理を中断
  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  try {
    dispatch(accessStart());
    const docId = await cardsRef
      .add({
        userId: currentUser?.uid,
        taskListId: taskListId,
        title: title,
        body: '',
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
      })
      .then((docRef) =>
        docRef.get().then(function (doc) {
          listsRef.doc(taskListId).update({
            cards: firebase.firestore.FieldValue.arrayUnion({
              id: doc.id,
              ...doc.data(),
            }),
          });
          return doc.id;
        })
      );
    dispatch(
      addCardSuccess({ taskListId: taskListId, id: docId, title: title })
    );
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const removeCard = (props: { taskCardId: string }): AppThunk => async (
  dispatch,
  getState
) => {
  const { taskCardId } = props;
  const card = getState().tasks.cards[taskCardId];
  const listId = card.taskListId;
  const boardId = getState().tasks.lists[listId].taskBoardId;
  const listsRef = db.collection('boards').doc(boardId).collection('lists');

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  // 所有者(データの'userId'が'currentUser'の'uid'と一致)でなければ処理を中断
  if (!isOwnedBy(card.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    const docRef = db
      .collection('boards')
      .doc(boardId)
      .collection('cards')
      .doc(taskCardId);
    await docRef.delete();
    const newCards = getState().tasks.lists[listId].cards.filter(
      (card) => card.id !== taskCardId
    );
    await listsRef.doc(listId).update({
      cards: newCards,
    });
    dispatch(removeCardSuccess({ taskCardId: taskCardId }));
    dispatch(setNotification(Notification.SuccessfullyDeleted));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

interface editCardProps {
  taskCardId: string;
  title?: string;
  body?: string;
}
export const editCard = (props: editCardProps): AppThunk => async (
  dispatch,
  getState
) => {
  const { taskCardId, title, body } = props;
  const card = getState().tasks.cards[taskCardId];
  const listId = card.taskListId;
  const boardId = getState().tasks.lists[listId].taskBoardId;

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(card.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    const docRef = db
      .collection('boards')
      .doc(boardId)
      .collection('cards')
      .doc(taskCardId);
    title &&
      (await docRef.update({
        title: title,
        updatedAt: firebase.firestore.Timestamp.now(),
      }));
    body &&
      (await docRef.update({
        body: body,
        updatedAt: firebase.firestore.Timestamp.now(),
      }));
    dispatch(
      editCardSuccess({ taskCardId: taskCardId, title: title, body: body })
    );
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const toggleCard = (props: { taskCardId: string }): AppThunk => async (
  dispatch,
  getState
) => {
  const { taskCardId } = props;
  const card = getState().tasks.cards[taskCardId];
  const listId = card.taskListId;
  const boardId = getState().tasks.lists[listId].taskBoardId;

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(card.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    const docRef = db
      .collection('boards')
      .doc(boardId)
      .collection('cards')
      .doc(taskCardId);
    await docRef.update({
      done: !card.done,
    });
    dispatch(toggleCardSuccess({ taskCardId: taskCardId }));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const sortCard = (props: {
  taskBoardId: string;
  taskListArray: TaskListsArray;
}): AppThunk => async (dispatch, getState) => {
  const { taskBoardId, taskListArray } = props;
  const board = getState().tasks.boards[taskBoardId];

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(board.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }

  try {
    dispatch(accessStart());
  } catch (error) {
    dispatch(accessFailure(error));
  }
  taskListArray.map(async (list) => {
    const docRef = db
      .collection('boards')
      .doc(taskBoardId)
      .collection('lists')
      .doc(list.id);
    await docRef.update({
      cards: list.cards,
    });
  });
  dispatch(setNotification(Notification.SuccessfullyUpdated));
};

export const addList = (props: {
  taskBoardId: string;
  title: string;
}): AppThunk => async (dispatch) => {
  const { taskBoardId, title } = props;

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  try {
    dispatch(accessStart());
    const listsRef = db
      .collection('boards')
      .doc(taskBoardId)
      .collection('lists');
    const docId = await listsRef
      .add({
        userId: currentUser?.uid,
        taskBoardId: taskBoardId,
        title: title,
        cards: [],
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
      })
      .then((docRef) => docRef.id);
    dispatch(
      addListSuccess({ taskBoardId: taskBoardId, id: docId, title: title })
    );
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const editList = (props: {
  taskListId: string;
  title: string;
}): AppThunk => async (dispatch, getState) => {
  const { taskListId, title } = props;
  const list = getState().tasks.lists[taskListId];
  const boardId = list.taskBoardId;

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(list.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    const docRef = db
      .collection('boards')
      .doc(boardId)
      .collection('lists')
      .doc(taskListId);
    await docRef.update({
      title: title,
      updatedAt: firebase.firestore.Timestamp.now(),
    });
    dispatch(editListSuccess({ taskListId: taskListId, title: title }));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const removeList = (props: { taskListId: string }): AppThunk => async (
  dispatch,
  getState
) => {
  const { taskListId } = props;
  const list = getState().tasks.lists[taskListId];
  const boardId = list.taskBoardId;
  const listsRef = db.collection('boards').doc(boardId).collection('lists');
  const cards = getState().tasks.cards;
  const cardsRef = db.collection('boards').doc(boardId).collection('cards');

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(list.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    await listsRef.doc(taskListId).delete();
    Object.values(cards).forEach(
      (card) => card.taskListId === taskListId && cardsRef.doc(card.id).delete()
    );
    dispatch(removeListSuccess({ taskListId: taskListId }));
    dispatch(setNotification(Notification.SuccessfullyDeleted));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const addBoard = (props: { title: string }): AppThunk => async (
  dispatch
) => {
  const { title } = props;

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  try {
    dispatch(accessStart());
    const docId = await db
      .collection('boards')
      .add({
        userId: currentUser?.uid,
        title: title,
        createdAt: firebase.firestore.Timestamp.now(),
        updatedAt: firebase.firestore.Timestamp.now(),
      })
      .then((docRef) => docRef.id);
    dispatch(addBoardSuccess({ id: docId, title: title }));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const removeBoard = (props: { taskBoardId: string }): AppThunk => async (
  dispatch,
  getState
) => {
  const { taskBoardId } = props;
  const board = getState().tasks.boards[taskBoardId];
  const docRef = db.collection('boards').doc(taskBoardId);
  const listsRef = docRef.collection('lists');
  const cardsRef = docRef.collection('cards');
  const { lists, cards } = getState().tasks;

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(board.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    await docRef.delete();
    Object.values(lists).forEach((list) => {
      if (list.taskBoardId === taskBoardId) {
        Object.values(cards).forEach(
          (card) =>
            card.taskListId === list.id && cardsRef.doc(card.id).delete()
        );
        listsRef.doc(list.id).delete();
      }
    });
    dispatch(removeBoardSuccess({ taskBoardId: taskBoardId }));
    dispatch(setNotification(Notification.SuccessfullyDeleted));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};

export const editBoard = (props: {
  taskBoardId: string;
  title: string;
}): AppThunk => async (dispatch, getState) => {
  const { taskBoardId, title } = props;
  const board = getState().tasks.boards[taskBoardId];
  const docRef = db.collection('boards').doc(taskBoardId);

  if (!isSignedIn()) {
    dispatch(setNotification(Notification.NotSignedInWarning));
    return;
  }
  if (!isOwnedBy(board.userId)) {
    dispatch(setNotification(Notification.PermissionError));
    return;
  }
  try {
    dispatch(accessStart());
    await docRef.update({
      title: title,
      updatedAt: firebase.firestore.Timestamp.now(),
    });
    dispatch(editBoardSuccess({ taskBoardId: taskBoardId, title: title }));
  } catch (error) {
    dispatch(accessFailure(error));
  }
};
