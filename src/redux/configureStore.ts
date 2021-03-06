import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';

import { rootEpic, rootReducer }  from './Reducers';

declare var window:any;
const isDevelopment = process.env.NODE_ENV === 'development';

const composeEnhancers = isDevelopment ? (window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose) : compose;

const epicMiddleware = createEpicMiddleware();

const configureStore = (initialState:any) => {
  const store = createStore(rootReducer, initialState, composeEnhancers(
    applyMiddleware(epicMiddleware)
  ));

  epicMiddleware.run(rootEpic);
  
  return store;
}

export default configureStore