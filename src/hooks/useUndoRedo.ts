import { useReducer } from 'react';

interface UndoState {
  value: string;
  history: string[];
  index: number;
}

type UndoAction =
  | { type: 'set'; value: string }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; value: string };

const createState = (value: string): UndoState => ({
  value,
  history: [value],
  index: 0,
});

const MAX_HISTORY = 80;

const reducer = (state: UndoState, action: UndoAction): UndoState => {
  switch (action.type) {
    case 'set': {
      if (action.value === state.value) return state;
      const nextHistory = state.history.slice(0, state.index + 1);
      nextHistory.push(action.value);
      const trimmed =
        nextHistory.length > MAX_HISTORY
          ? nextHistory.slice(nextHistory.length - MAX_HISTORY)
          : nextHistory;
      return {
        value: action.value,
        history: trimmed,
        index: trimmed.length - 1,
      };
    }
    case 'undo': {
      if (state.index === 0) return state;
      const nextIndex = state.index - 1;
      return {
        ...state,
        index: nextIndex,
        value: state.history[nextIndex],
      };
    }
    case 'redo': {
      if (state.index >= state.history.length - 1) return state;
      const nextIndex = state.index + 1;
      return {
        ...state,
        index: nextIndex,
        value: state.history[nextIndex],
      };
    }
    case 'reset':
      return createState(action.value);
    default:
      return state;
  }
};

export const useUndoRedo = (initialValue: string) => {
  const [state, dispatch] = useReducer(reducer, initialValue, createState);

  return {
    value: state.value,
    set: (value: string) => dispatch({ type: 'set', value }),
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    reset: (value: string) => dispatch({ type: 'reset', value }),
    canUndo: state.index > 0,
    canRedo: state.index < state.history.length - 1,
  };
};
