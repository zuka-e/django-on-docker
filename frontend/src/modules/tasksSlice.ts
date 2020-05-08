import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ITaskCard, ITaskList, ITaskBoard } from '../components/Types';
import {
  taskCards,
  taskLists,
  taskBoards,
} from '../components/tasks/initial-data';

interface State {
  cardNum: number;
  cards: ITaskCard;
  listNum: number;
  lists: ITaskList;
  boardNum: number;
  boards: ITaskBoard;
}

const initialState: State = {
  cardNum: 4,
  cards: taskCards,
  listNum: 5,
  lists: taskLists,
  boardNum: 1,
  boards: taskBoards,
};

const tasksSlice = createSlice({
  name: 'tesks',
  initialState,
  reducers: {
    addCard(
      state: State,
      action: PayloadAction<{ taskListId: string; title: string }>
    ) {
      // 'taskListId'は'map()'以下の'list'から取得, 'title'は入力する
      const { taskListId, title } = action.payload;
      const id = (state.cardNum += 1);
      const taskCardId = `card-${id}`;
      const newCard = {
        taskListId: taskListId,
        id: taskCardId,
        title: title,
        done: false,
        body: '',
      };
      state.cards = { ...state.cards, [taskCardId]: newCard }; // 連想配列(オブジェクト)の追加
      state.lists[taskListId].taskCardIds.push(taskCardId); // 配列(Array<>)の追加
    },
    removeCard(state: State, action: PayloadAction<string>) {},

    addList: (
      state: State,
      action: PayloadAction<{ taskBoardId: string; title: string }>
    ) => {
      const { taskBoardId, title } = action.payload;
      const id = (state.listNum += 1);
      const taskListId = `list-${id}`;
      const newList = {
        taskBoardId: taskBoardId,
        id: taskListId,
        title: title,
        taskCardIds: [],
      };
      state.lists = { ...state.lists, [taskListId]: newList };
      state.boards[taskBoardId].taskListIds.push(taskListId);
    },
  },
});

export const { addCard, removeCard, addList } = tasksSlice.actions;

export default tasksSlice;
