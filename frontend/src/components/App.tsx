import React, { useState } from 'react';
import Form from './Form';
import List from './List';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import { Task } from './Types';
import './App.css';

const initialState: Task[] = [
  {
    id: 2,
    title: '次にやるやつ',
    done: false
  }, {
    id: 1,
    title: 'はじめにやるやつ',
    done: true
  }
]

const App: React.FC = () => {
  // setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  // オブジェクトの配列を変更するメソッドの型? (setStateマウスオーバーで表示)
  const [tasks, setTasks] = useState(initialState)
  return (
    <div>
      {/* 渡す値は子コンポーネントのpropsで定義 */}
      <TaskInput setTasks={setTasks} tasks={tasks} />
      <TaskList setTasks={setTasks} tasks={tasks} />
    </div>
  )
}

export default App;
