import React from 'react';
import { Route, Redirect } from "react-router-dom";
import { BrowserRouter } from 'react-router-dom/cjs/react-router-dom.min';

const ProtectedRoute = ({ component: Component, ...props  }) => {
  return (
    <BrowserRouter>
      <Route exact>
        {
          () => props.loggedIn ? <Component {...props} /> : <Redirect to="./signin" />
        }
      </Route>
    </BrowserRouter>
)}

export default ProtectedRoute;