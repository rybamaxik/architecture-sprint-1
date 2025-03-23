import React, { lazy, Suspense, useEffect } from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import * as auth from "../utils/auth.js";

import '../index.css';

const Login = lazy(() => import('auth/Login').catch(() => {
  return { default: () => <div className='error'>Login component is not available!</div> };
})
);

const Register = lazy(() => import('auth/Register').catch(() => {
  return { default: () => <div className='error'>Register component is not available!</div> };
})
);

const InfoTooltip = lazy(() => import('auth/InfoTooltip').catch(() => {
  return { default: () => <div className='error'>InfoTooltip component is not available!</div> };
})
);

// Я слишком плохо знаю JS (и webpack), поэтому у меня не получается импортировать функцию 
// CheckToken из микрофронтэнда auth. Поэтому закомментирую пока импорт (снизу):
//const CheckToken = (token) => import('auth/CheckToken').catch(() => {
//  return { default: () => "Error importing CheckToken" };
//});
// Пришлось дублировать CheckToken здесь в utils/auth.js
// Наверное, можно было бы вынести эту функцию в shared (как я сделал с CurrentUserContext), 
// но эта функция по идее должна быть рядом с остальными функциями auth. В общем, пока не 
// знаю, как лучше поступить :-(

const Main = lazy(() => import('cardboard/Main').catch(() => {
  return { default: () => <div className='error'>Main component is not available!</div> };
})
);

const ProtectedRoute = lazy(() => import('cardboard/ProtectedRoute').catch(() => {
  return { default: () => <div className='error'>ProtectedRoute: error importing ProtectedRoute</div> };
})
);

function App() {
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  //В компоненты добавлены новые стейт-переменные: email — в компонент App
  const [email, setEmail] = React.useState("");

  const history = useHistory();

  // при монтировании App описан эффект, проверяющий наличие токена и его валидности
  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      // TODO: микрофронтэнд host должен обращаться к микрофронтэнду auth за функционалом checkToken, 
      // но у меня не получилось это сделать, поэтому пока оставил checkToken в host/src/utils/auth.js

      //CheckToken(token) - закомментировал (так мы обращаемся к auth/CheckToken)
      auth.checkToken(token)
        .then((res) => {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push("/");
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          console.log(err);
        });
    }
  }, [history]);

  function onCloseInfoTooltip() {
    setIsInfoToolTipOpen(false);
  }

  const handleRegOk = event => {
    setTooltipStatus("success");
    setIsInfoToolTipOpen(true);

    history.push("/signin");
  }

  const handleRegFail = event => {
    setTooltipStatus("fail");
    setIsInfoToolTipOpen(true);
  }

  useEffect(() => {
    addEventListener("reg-ok", handleRegOk);
    return () => removeEventListener("reg-ok", handleRegOk)
  }, []);

  useEffect(() => {
    addEventListener("reg-fail", handleRegFail);
    return () => removeEventListener("reg-fail", handleRegFail)
  }, []);

  const handleLoginOk = event => {
    setIsLoggedIn(true);
    setEmail(event.detail.email_address);
    localStorage.setItem('jwt', event.detail.jwt);

    history.push("/");
  }

  const handleLoginFail = event => {
    setTooltipStatus("fail");
    setIsInfoToolTipOpen(true);
  }

  useEffect(() => {
    addEventListener("login-ok", handleLoginOk);
    return () => removeEventListener("login-ok", handleLoginOk)
  }, []);

  useEffect(() => {
    addEventListener("login-fail", handleLoginFail);
    return () => removeEventListener("login-fail", handleLoginFail)
  }, []);

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push("/signin");
  }
  
  return (
    <div className="page__content">
      <Header email={email} onSignOut={onSignOut} />
      <Switch>
        <ProtectedRoute
          exact
          path="/"
          component={Main}
          loggedIn={isLoggedIn}
        />
        <Route path="/signup">
          <Suspense><Register /></Suspense>
        </Route>
        <Route path="/signin">
          <Suspense><Login /></Suspense>
        </Route>
      </Switch>
      <Footer />
      <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да" />
      <Suspense>
        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={onCloseInfoTooltip}
          status={tooltipStatus}
        />
      </Suspense>  
    </div>
  );
}

export default App;
