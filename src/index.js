import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import expect from 'expect';
import deepFreeze from 'deep-freeze';

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false
                }
            ];
        default:
            return state;
    }
};

const testAddTodo = () => {
    const stateBefore = [];
    const action = {
        type: 'ADD_TODO',
        id: 0,
        text: 'Learn Redux'
    };
    const stateAfter = [
        {
            id: 0,
            text: 'Learn Redux',
            completed: false
        }
    ];

    deepFreeze(stateBefore);
    deepFreeze(action);

    expect(
        todos(stateBefore, action)
    ).toEqual(stateAfter);
};

testAddTodo();
console.log('All tests passed.');

const TodoApp = () => (<div>Initial Refactor Commit</div>)


ReactDOM.render(<TodoApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
