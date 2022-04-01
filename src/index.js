import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import './styles.css';
import Grid from './Grid';

const rootElement = document.getElementById('root');
ReactDOM.render(
  <StrictMode>
    <Grid />
  </StrictMode>,
  rootElement
);
