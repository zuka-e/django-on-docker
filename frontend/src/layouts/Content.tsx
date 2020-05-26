import React, { useEffect } from 'react';

import { Switch, Route } from 'react-router-dom';
import { useFirestoreConnect } from 'react-redux-firebase';

import Home from '../components/Home';
import TaskBoard from '../components/tasks/TaskBoard';
import { useAppDispatch } from '../store/store';
import { fetchData } from '../store/tasksSlice';

const Content: React.FC = () => {
  const dispatch = useAppDispatch();

  // 初回アクセス時、データ取得
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  // Firestoreとリアルタイム同期
  useFirestoreConnect([
    {
      collection: 'boards',
      storeAs: 'boards', // stateアクセス時の名前
    },
    {
      // 上位のコレクション指定せずアクセス可能
      collectionGroup: 'lists',
      storeAs: 'lists',
    },
    {
      collectionGroup: 'cards',
      storeAs: 'cards',
    },
  ]);

  return (
    <Switch>
      <Route exact path='/'>
        <Home />
      </Route>
      <Route path='/boards/:boardId'>
        <TaskBoard />
      </Route>
    </Switch>
  );
};

export default Content;
